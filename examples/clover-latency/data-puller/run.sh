container=$(docker run -d data_poller)
docker logs -f ${container}
