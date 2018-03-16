FROM yandex/clickhouse-client

RUN \
  (apt-get update || echo 'here') && \
  apt-get install -y python python-dev python-pip python-virtualenv && \
  rm -rf /var/lib/apt/lists/*

# TODO: install pip, and requirements.txt

COPY poll.py .

ENTRYPOINT []
CMD ["python", "-u", "poll.py"]
