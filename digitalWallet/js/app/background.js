let dev = true;
let domainDW = dev ? "http://localhost:8000/" : '';
let domainBC = dev ? "http://localhost:8080/" : '';
let domainWB = dev ? "http://localhost:3000/" : '';
let statusThreadArray = [];

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        switch(message.type) {
            case "generateDID":
                let loggedInData = getStorageItem('user');
                let userRequest = {
                    username: loggedInData.user.username,
                    mnemonic: loggedInData.user.mnemonic,
                    passphrase: message.data.didTitle
                }
                ajaxBCCall("POST", "did/register", JSON.stringify(userRequest) , loggedInData.token, function (response) {
                    console.log(response);
                    if (response.message === "") {
                        let didRequest = {
                            title: userRequest.passphrase,
                            did: response.did,
                            operationId: response.operationId
                        }
                        let threadData = {
                            operationId: response.operationId,
                            userId: loggedInData.user._id,
                            did: response.did
                        }

                        ajaxDWCall("PUT", `wallet/users/${loggedInData.user._id}`, didRequest, loggedInData.token, function (response) {
                            let isValid = true;
                            if (!response.message) {
                                let newThread = {
                                    thread: setInterval(() => checkDidStatus(threadData.operationId, threadData.userId, threadData.did), 7000),
                                    lastStatus: "",
                                    did: threadData.did
                                }
                                statusThreadArray.push(newThread);
                            }
                        });
                    }
                });
                return true;
            case "onPopupInit":
                ajaxDWCall("GET", "wallet/me", {}, getStorageItem('user') ? getStorageItem('user').token : '', async function (response) {
                    if (response._id) {
                        sendResponse(response);
                    }
                });
                return true;
            case "login":
                let userLoginCreds = message.data;
                ajaxDWCall("POST", "wallet/login", userLoginCreds, '', function(response) {
                    if (response.token) {
                        setStorageItem('user', response);
                        sendResponse(response);
                    }
                });
                return true;
            case "register":
                let userRegisterCreds = message.data;
                ajaxDWCall("POST", "wallet/register", userRegisterCreds, '', function(response) {
                        sendResponse(response);
                });
                return true;
        }
    }
);

function ajaxDWCall(type, path, data, token, callback) {
    $.ajax({
        url: domainDW + path,
        type: type,
        data: data,
        headers: {
            token: token
        },
        success: function(response) {
            callback(response);
        },
        error: function (response) {
            callback(response);
        }
    });
}

function ajaxBCCall(type, path, data, token, callback) {
    $.ajax({
        url: domainBC + path,
        type: type,
        data: data,
        datatype: "json",
        contentType: "application/json; charset=utf-8",
        headers: {
            token: token
        },
        success: function(response) {
            callback(response);
        },
        error: function (response) {
            callback(response);
        }
    });
}

function setStorageItem(varName, data) {
    if (varName !== 'searchPageData') {
        window.localStorage.setItem(varName, JSON.stringify(data));
    }
}

function getStorageItem(varName) {
    return JSON.parse(localStorage.getItem(varName));
}

function checkDidStatus(idOperation, idUser, did) {
    let currThread = {};
    let currIndex = -1;
    for (let i = 0; i < statusThreadArray.length; i++) {
        if (statusThreadArray[i].did === did) {
            currThread = statusThreadArray[i];
            currIndex = i;
            break;
        }
    }
    ajaxBCCall("GET", `did/${idOperation}/status`, {}, getStorageItem('user') ? getStorageItem('user').token : '', function (response) {
        let status = response.status;
        console.log(currThread, " - ", status);
        if (status !== currThread.lastStatus) {
            ajaxDWCall("PUT", `wallet/users/${idUser}/did`, { did: did, status: status }, getStorageItem('user') ? getStorageItem('user').token : '', function (response) {
                currThread.lastStatus = status;
                if (status === "Success" || status === "Rejected" || status === "Unknown operation") {
                    statusThreadArray.splice(currIndex, 1);
                    clearInterval(currThread.thread);
                }
            });
        }
    });
}