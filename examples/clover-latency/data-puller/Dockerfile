FROM yandex/clickhouse-client

RUN \
  (apt-get update || echo 'here') && \
  apt-get install -y python python-dev python-pip python-virtualenv && \
  rm -rf /var/lib/apt/lists/*

RUN mkdir data

# TODO: install pip, and requirements.txt

COPY pull.py .

ENTRYPOINT []
CMD ["python", "-u", "pull.py"]
