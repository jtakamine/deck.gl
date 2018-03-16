rm -r latency_data/*

container=$(docker ps | grep data_poller | head -1 | awk '{print $1}')
docker cp ${container}:/data/. latency_data/

ls latency_data/ | sort -k2 -t"_" -n | tail -1