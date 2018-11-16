# Kabric Network

## Folders

1. basic-network
2. scripts
3. api
4. chaincode : chaincode / chaincode unit test
5. chaincode-dev-mode : chaincode dev mode

---

## basic-network

提供基本Fabric網路

- 1 orgnization
- 1 peer (with couch db)
- 1 ca service
- 1 orderer
- 1 cli

預設掛載的chaincode路徑
```
 $GOPATH/src/kabric:/opt/gopath/src/kabric
```

---

## scripts

啟動`basic-network`網路
```
./startBaiscNetwork.sh
```

啟動網路後，可執行以下指令測試chaincode是否有正確安裝及初始化
```sh
docker exec -it cli bash
peer chaincode query -C mychannel -n kcc -c '{"Args":[""]}'
```

以下四個腳本改寫自官方[fabcar範例](https://github.com/hyperledger/fabric-samples/tree/release-1.3/fabcar)，詳細可參考[Write your first application](https://hyperledger-fabric.readthedocs.io/en/release-1.3/write_first_app.html)

- enrollAdmin.js : 建立admin，必須先執行此腳本
- registerUser.js : 建立user1，建立好admin後，建立一般使用者以操作chaincode
- query.js : 執行chaincode的query
- invoke.js : 執行chaincode的invoke

>記得先執行 `npm install`

補充: 移除所有chaincode image(避免舊的chaincode container一直被docker cache住，而無法安裝新的chaincode)
```sh
# 找到所有dev-peer開頭的image，列出其id(-q)，然後執行docker rmi移除之
docker rmi $(docker images dev-peer* -a -q)
```
---

## api

`app.js` 提供node.js的server side api
```sh
# 啟動 server
node app
```

測試
```sh
curl -s -X POST "http://localhost:4001/enrollAdmin"
curl -s -X POST "http://localhost:4001/registerUser"

# Invoke chaincode "set" function, and set key1 to v1
curl -s -X POST --header "Content-Type: application/json" -d '{"key":"key1","value":"v1"}' "http://localhost:4001/set"

# Query chaincode "get" function, and get the value of key1
curl -s -X GET "http://localhost:4001/get/key1"
```
>可搭配Couch DB測試: http://localhost:5984/_utils