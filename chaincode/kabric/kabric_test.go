package main

import (
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

func TestInvoke(t *testing.T) {
	//
	kcc := new(SimpleAsset)

	stub := shim.NewMockStub("kcc", kcc)

	res := stub.MockInvoke("1", nil)

	assert.Equal(t, res.Status, int32(shim.OK))
}
