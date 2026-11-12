"""Client for a shared, private-network model endpoint.

Uses an availability endpoint to yield to other workloads and avoid model swaps.
Endpoint URLs and the model name come from environment variables or local.env.
This client-side check is not a substitute for server access controls.
"""
import ipaddress
import json
import os
import socket
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PRIVATE = tuple(ipaddress.ip_network(n) for n in ("10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "100.64.0.0/10", "127.0.0.0/8"))
DEMAND_TTL_S = 120


def _env():
    cfg = dict(os.environ)
    p = ROOT / "local.env"
    if p.exists():
        for line in p.read_text().splitlines():
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.split("=", 1)
                cfg.setdefault(k.strip(), v.strip())
    return cfg["SKY_MODEL_BASE_URL"].rstrip("/"), cfg["SKY_MODEL_NAME"], cfg["SKY_LANE_URL"].rstrip("/")


BASE, MODEL, LANE = _env()
_opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))


def _check_private(url):
    host = urllib.parse.urlparse(url).hostname
    for a in socket.getaddrinfo(host, None, type=socket.SOCK_STREAM):
        if not any(ipaddress.ip_address(a[4][0]) in n for n in PRIVATE):
            raise RuntimeError(f"{host} does not resolve to a private address")


_check_private(BASE)
_check_private(LANE)


def _get(url, timeout=10):
    assert "?" not in url
    with _opener.open(urllib.request.Request(url, method="GET"), timeout=timeout) as r:
        return json.load(r)


def lane_decision():
    try:
        lane = _get(LANE + "/lane", timeout=5)
    except Exception:
        return "wait", "lane unreachable"
    if lane.get("error"):
        return "wait", "arbiter error"
    now, demand = lane.get("now"), lane.get("demand_at")
    if isinstance(demand, (int, float)) and isinstance(now, (int, float)) and now - demand < DEMAND_TTL_S:
        return "yield", "estate work waiting"
    if any(c.get("active") for c in (lane.get("comfy") or {}).values()):
        return "wait", "estate render running"
    if lane.get("state") in ("tyler", "estate"):
        return "go", f"lane {lane.get('state')}"
    return "wait", f"unknown lane state {lane.get('state')!r}"


def other_model_loaded():
    """Name of a loaded model that isn't ours (sending would force a swap), else None."""
    root = BASE[: -len("/v1")]
    try:
        loaded = [m["name"] for m in _get(root + "/api/ps").get("models", [])]
    except Exception:
        return "unknown (ps failed)"
    others = [m for m in loaded if m != MODEL]
    return others[0] if others else None


def model_digest():
    root = BASE[: -len("/v1")]
    for m in _get(root + "/api/tags")["models"]:
        if m["name"] == MODEL:
            return m["digest"]
    raise RuntimeError(f"{MODEL} not on server")


def wait_for_turn(log=print, max_wait_s=6 * 3600):
    start = time.monotonic()
    while True:
        action, why = lane_decision()
        other = other_model_loaded() if action == "go" else None
        if action == "go" and not other:
            return
        if time.monotonic() - start > max_wait_s:
            raise TimeoutError("Flint not available")
        log(f"waiting for Flint: {why if action != 'go' else 'another model loaded: ' + other}")
        time.sleep(60)


def chat_json(system, user, max_tokens=400, timeout=180):
    """One deterministic JSON call, thinking off. Returns (dict, seconds, usage)."""
    payload = {"model": MODEL, "temperature": 0, "max_tokens": max_tokens, "reasoning_effort": "none",
               "response_format": {"type": "json_object"},
               "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}]}
    req = urllib.request.Request(BASE + "/chat/completions", data=json.dumps(payload).encode(),
                                 headers={"Content-Type": "application/json"})
    t = time.monotonic()
    with _opener.open(req, timeout=timeout) as r:
        body = json.load(r)
    dt = time.monotonic() - t
    content = body["choices"][0]["message"]["content"]
    return json.loads(content), dt, body.get("usage", {})
