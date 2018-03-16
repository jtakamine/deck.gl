# container=$(docker run -d -e END_TIME="03-15-18 23:59:59" data_poller)
# docker logs -f ${container}

container=$(docker run -d -e START_TIME="03-10-18 00:00:00" -e END_TIME="03-15-18 23:59:59" data_poller)

docker logs -f ${container}
