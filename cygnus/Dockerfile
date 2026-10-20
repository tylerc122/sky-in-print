FROM python:3.12-slim
WORKDIR /app
# Triage needs only the standard library: no pip installs.
COPY src ./src
COPY prereg ./prereg
ARG APP_UID=10001
ARG APP_GID=10001
RUN groupadd --gid "$APP_GID" sky && useradd --uid "$APP_UID" --gid sky --no-create-home sky
USER sky
ENV PYTHONPATH=/app/src PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 SKY_IDLE_AFTER_DONE=1
CMD ["python", "-m", "skyinprint.run_triage_all"]
