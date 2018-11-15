```sh
cd dev-network
```

Terminal 1: Create containers
```sh
# If windows, run this first
export COMPOSE_CONVERT_WINDOWS_PATHS=1

docker-compose -f docker-compose-simple.yaml up
```

Terminal 2: Build & Run

>以 `kabric` chaincode為例
```sh
docker exec -it chaincode bash

cd chaincode/kabric

# Build to bin folder
go build -o bin/kabric

# Run chaincode
CORE_PEER_ADDRESS=peer:7052 CORE_CHAINCODE_ID_NAME=kcc:0 ./bin/kabric
```

>kcc means kabric chaincode

Terminal 3: Use chaincode
```sh
docker exec -it cli bash

# Install
peer chaincode install -p chaincode/kabric -n kcc -v 0

# Instantiate
peer chaincode instantiate -n kcc -v 0 -c '{"Args":[]}' -C myc

# Invoke
peer chaincode invoke -n kcc -c '{"Args":[]}' -C myc

# Query
peer chaincode query -n kcc -c '{"Args":[]}' -C myc
```