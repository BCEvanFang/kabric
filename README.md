# Kabric Network

## Folders

1. basic-network
2. scripts
3. api

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

以下四個腳本改寫自官方[fabcar範例](https://github.com/hyperledger/fabric-samples/tree/release-1.3/fabcar)，詳細可參考[Write your first application](https://hyperledger-fabric.readthedocs.io/en/release-1.3/write_first_app.html)

- enrollAdmin.js : 建立admin，必須先執行此腳本
- registerUser.js : 建立user1，建立好admin後，建立一般使用者以操作chaincode
- query.js : 執行chaincode的query
- invoke.js : 執行chaincode的invoke

>記得先執行 `npm install`

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
curl -s -X GET "http://localhost:4001/query"
curl -s -X POST "http://localhost:4001/invoke"
```