package main

import (
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/hyperledger/fabric/protos/peer"
)

// SimpleAsset implements a simple chaincode to manage an asset
type SimpleAsset struct {
}

// Init function
func (t *SimpleAsset) Init(stub shim.ChaincodeStubInterface) peer.Response {

	fmt.Println("Init()")

	return shim.Success(nil)
}

// Invoke function
func (t *SimpleAsset) Invoke(stub shim.ChaincodeStubInterface) peer.Response {

	fmt.Println("Invoke()")

	return shim.Success([]byte("Hello Kabric!!"))
}

// main function starts up the chaincode in the container during instantiate
func main() {
	if err := shim.Start(new(SimpleAsset)); err != nil {
		fmt.Printf("Error starting SimpleAsset chaincode: %s", err)
	}
}
