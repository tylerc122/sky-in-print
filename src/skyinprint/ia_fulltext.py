"""Search Internet Archive full texts (journals, museum reports, histories) for a lead. Newspapers and post-1960
items are dropped. Usage: python -m skyinprint.ia_fulltext queries.json out.json  (queries: {lead: [query, ...]})
"""
import json,sys,time,urllib.parse,urllib.request,re
def q(query,n=50):
    u="https://archive.org/services/search/beta/page_production/?"+urllib.parse.urlencode({"service_backend":"fts","user_query":query,"hits_per_page":n,"page":1,"aggregations":"false"})
    for a in range(3):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"sky-in-print-research"}),timeout=60))["response"]["body"]["hits"]["hits"]
        except Exception as e: time.sleep(5)
    return []
queries=json.load(open(sys.argv[1]))
out={}
for name,qs in queries.items():
    rows=[]
    for s in qs:
        for h in q(s):
            f=h["fields"]; y=f.get("year") or 0
            if y and y>1960: continue
            if "newspapers" in (f.get("collection") or []): continue
            hl=" | ".join(h.get("highlight",{}).get("text",[]))[:600]
            rows.append({"q":s,"id":f["identifier"],"title":f.get("title","")[:90],"year":y,"page":f.get("page_num"),"hl":re.sub(r"\s+"," ",hl)})
        time.sleep(1)
    seen=set(); rows=[r for r in rows if not (r["id"] in seen or seen.add(r["id"]))]
    out[name]=rows
    print(f"### {name}: {len(rows)} non-newspaper hits")
    for r in rows[:8]: print(f"  {r['year']} {r['title'][:60]} [{r['id']} p{r['page']}]\n     {r['hl'][:300]}")
json.dump(out,open(sys.argv[2],"w"),indent=1)
