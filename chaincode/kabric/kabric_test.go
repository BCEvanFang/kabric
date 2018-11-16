package main

import (
	"fmt"
	"testing"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/stretchr/testify/assert"
)

func TestInit(t *testing.T) {
	//
	kcc := new(SimpleAsset)

	stub := shim.NewMockStub("kcc", kcc)

	res := stub.MockInit("1", nil)

	assert.Equal(t, res.Status, int32(shim.OK))
}

// 傳入chaincode不支援的function，應能回報錯誤
func TestChaincodeNoteFound(t *testing.T) {
	// Arrange
	kcc := new(SimpleAsset)
	stub := shim.NewMockStub("kcc", kcc)
	args := [][]byte{[]byte("chaicode_function_not_exists")}

	// Act
	res := stub.MockInvoke("1", args)
	fmt.Println(res)

	// Assert
	assert.Equal(t, int32(500), res.Status)
	assert.Equal(t, "Chaincode function not found", res.Message)
}

// Test: invoke function: set
// 沒有傳入要查詢的key值，會回傳 Status code=500以及錯誤訊息
func TestInvokeGetWithoutKey(t *testing.T) {
	// Arrange
	kcc := new(SimpleAsset)
	stub := shim.NewMockStub("kcc", kcc)

	args := [][]byte{[]byte("get")}

	// Act
	res := stub.MockInvoke("1", args)

	// Assert
	assert.Equal(t, int(res.Status), 500)
	assert.Equal(t, res.Message, "Incorrect arguments. Expecting a key")
}

// Test: invoke function: set
// 只有傳入key時，會出錯
func TestInvokeSetWithoutValue(t *testing.T) {
	// Arrange
	kcc := new(SimpleAsset)
	stub := shim.NewMockStub("kcc", kcc)

	args := [][]byte{[]byte("set"), []byte("key")}

	// Act
	res := stub.MockInvoke("1", args)

	// Assert
	assert.Equal(t, int(res.Status), 500)
	assert.Equal(t, res.Message, "Incorrect arguments. Expecting a key and a value")
}

// Test: invoke function: get
// 對於存入的key要能取出value
func TestInvokeSetValueThenGetValue(t *testing.T) {
	// Arrange
	kcc := new(SimpleAsset)
	stub := shim.NewMockStub("kcc", kcc)

	setArgs := [][]byte{[]byte("set"), []byte("the_key"), []byte("the_value")}
	setExpectStatus := int32(200)

	getArgs := [][]byte{[]byte("get"), []byte("the_key")}
	getExpectMessage := []byte("the_value")

	// Act: set value
	setResult := stub.MockInvoke("1", setArgs)

	// Act: get value
	getResult := stub.MockInvoke("1", getArgs)

	// Assert: set result
	assert.Equal(t, setExpectStatus, setResult.Status)

	// Assert: get result
	assert.Equal(t, getExpectMessage, getResult.Payload)
}
