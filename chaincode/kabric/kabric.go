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

	fn, args := stub.GetFunctionAndParameters()

	fmt.Println("Invoke: ", fn)
	fmt.Println("Args: ", args)

	var result string
	var err error

	if fn == "get" {

		result, err = get(stub, args)

	} else if fn == "set" {

		result, err = set(stub, args)

	} else {

		err = fmt.Errorf("Chaincode function not found")

	}

	if err != nil {

		return shim.Error(err.Error())

	}

	return shim.Success([]byte(result))
}

// Get returns the value of the specified asset key
func get(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 1 {
		return "", fmt.Errorf("Incorrect arguments. Expecting a key")
	}

	value, err := stub.GetState(args[0])
	if err != nil {
		return "", fmt.Errorf("Failed to get asset: %s with error: %s", args[0], err)
	}
	if value == nil {
		return "", fmt.Errorf("Asset not found: %s", args[0])
	}
	return string(value), nil
}

// Set stores the asset (both key and value) on the ledger.
// If the key exists, it will override the value with the new one
func set(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 2 {
		return "", fmt.Errorf("Incorrect arguments. Expecting a key and a value")
	}

	err := stub.PutState(args[0], []byte(args[1]))
	if err != nil {
		return "", fmt.Errorf("Failed to set asset: %s", args[0])
	}
	return args[1], nil
}

// main function starts up the chaincode in the container during instantiate
func main() {
	if err := shim.Start(new(SimpleAsset)); err != nil {
		fmt.Printf("Error starting SimpleAsset chaincode: %s", err)
	}
}
