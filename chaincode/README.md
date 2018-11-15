# Chaincode

## Unit Test Commands
```sh
# 顯示測試詳細結果
go test -v

# 覆蓋率
go test -v -cover

# 以HTML呈現覆蓋率
go test ./... -coverprofile=cover.out
go tool cover -html=cover.out
```