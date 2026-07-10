FROM cypress/included:14.0.1

USER root
RUN rm -f /etc/apt/sources.list.d/google-chrome.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends openjdk-17-jre-headless \
  && rm -rf /var/lib/apt/lists/*
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

WORKDIR /e2e
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

ENTRYPOINT ["npm"]
CMD ["run", "regressao"]
