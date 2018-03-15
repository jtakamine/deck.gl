
if [ -z "${MapboxAccessToken}" ]; then
  echo 'Run the following to download the Map background from the Mapbox API:';
  echo '$ export MapboxAccessToken=<your_token_here>';
fi

docker run -p 8080:8080 -d -e MapboxAccessToken=${MapboxAccessToken} latency_visualization
