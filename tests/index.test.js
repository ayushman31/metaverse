const axios2 = require("axios");

const BACKEND_URL = "http://localhost:3000";
const WS_URL = "ws://localhost:3001";
jest.setTimeout(15000); // Increase timeout to 15000ms (15 seconds) for all tests


const axios = {
  post: async (...args) => {
      try {
          const res = await axios2.post(...args)
          return res
      } catch(e) {
          return e.response
      }
  },
  get: async (...args) => {
      try {
          const res = await axios2.get(...args)
          return res
      } catch(e) {
          return e.response
      }
  },
  put: async (...args) => {
      try {
          const res = await axios2.put(...args)
          return res
      } catch(e) {
          return e.response
      }
  },
  delete: async (...args) => {
      try {
          const res = await axios2.delete(...args)
          return res
      } catch(e) {
          return e.response
      }
  },
}


describe("Authentication" , () => {
  test('User is able to signup succesfully' , async () => {
    const username = `ayushman${Math.random()}`; 
    const password = '123456';

    const response = await axios.post(`${BACKEND_URL}/api/v1/signup` , {
      username , password , type: 'admin'
    });
    expect(response.status).toBe(200);

    const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/signup` , {
      username, password, type:'admin'
    });
    expect(updatedResponse.status).toBe(400);
  });

  test('Signup request fails if the username is empty' , async() => {
    const username = `ayushman${Math.random()}`; 
    const password = "123456";

    const response = await axios.post(`${BACKEND_URL}/api/v1/signup` , {
      password
    })

    expect(response.status).toBe(400)
  });

  test('Signin succeeds if the username and password is correct' , async() => {
    const username = `ayushman${Math.random()}`;
    const password = '123456';

    await axios.post(`${BACKEND_URL}/api/v1/signup` ,{
      username , password , type: 'admin'
    } )

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin` , {
      username , password
    });

    expect(response.status).toBe(200);
    expect(response.data.token).toBeDefined();
  });

  test('Signin fails if the username and password are incorrect' , async() => {
    const username = `ayushman${Math.random()}`;
    const password = '123456';

    await axios.post(`${BACKEND_URL}/api/v1/signup` ,{
      username , password , type: 'admin'
    } );

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin` , {
      username: "Wrong username" , password
    });

    expect(response.status).toBe(403);
  })
});

describe("User metadata endpoint" , () => {
  let token;
  let avatarId;

  beforeAll(async () => {
    const username = `ayushman-${Math.random()}`;
    const password = '123456';

    await axios.post(`${BACKEND_URL}/api/v1/signup` , {
      username , password , type: 'admin'
    });

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin` , {
      username , password
    })

    token = response.data.token;

    const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar` , {
      "name": "Timmy",
      "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
    } , {
      headers: {
        authorization : `Bearer ${token}`
      }
    })

    avatarId = avatarResponse.data.avatarId
    
  })

  test("User is not able to update their metadata with wrong avatarId" , async() => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata` , {
      avatarId: "123123123"
    }  , {
      headers : {
        authorization: `Bearer ${token}`
      }
    })

    expect(response.status).toBe(400);
  });

  test("User is able to update their metadata with correct avatarId" , async() => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata` , {
      avatarId
    }  , {
      headers : {
        authorization: `Bearer ${token}`
      }
    })

    expect(response.status).toBe(200);
  });

  test("User is not able to update their metadata if the auth header is not present" , async() => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata` , {
      avatarId
    });

    expect(response.status).toBe(403);
  });
});

describe("User avatar information" , () => {
  let token;
  let avatarId;
  let userId;
  beforeAll(async() => {
    const username = `ayushman-${Math.random()}`;
    const password = '123456';

    const signUpResponse = await axios.post(`${BACKEND_URL}/api/v1/signup` , {
      username , password , type: 'admin'
    });
    userId = signUpResponse.data.userId;

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin` , {
      username , password
    })

    token = response.data.token;

    const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar` , {
      "name": "Timmy",
      "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
    } , {
      headers: {
        authorization : `Bearer ${token}`
      }
    })

    avatarId = avatarResponse.data.avatarId;

  })

  test("User is able to get the avatar" , async() => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=["${userId}"]`);  
    
    expect(response.data.avatars.length).toBe(1);
    expect(response.data.avatars[0].userId).toBe(userId);
  })

  test("User is able to get all the avatars" , async() => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`);
    expect(response.data.avatars.length).not.toBe(0);
    const currentAvatar = response.data.avatars.find(x => x.id == avatarId);
    expect(currentAvatar).toBeDefined();
  })


});

describe("Space information" , () => {
  let adminId;
  let userId;
  let adminToken;
  let userToken;
  let elementId1;
  let elementId2;
  let mapId;

  beforeAll(async() => {
    const username = `ayushman${Math.random()}`;
    const password = '123456';

    const adminSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup` , {
      username , password , type: 'admin'
    });
    adminId = adminSignupResponse.data.userId;
   
    
    

    const adminSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin` , {
      username , password
    })
    adminToken = adminSigninResponse.data.token;
   

    const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup` , {
      username : username + '-user' , password , type: 'user'
    });
    userId = userSignupResponse.data.userId;

    
    

    const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin` , {
      username : username + '-user' , password
    })
    userToken = userSigninResponse.data.token;
    
    
    const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element` , {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      "width": 1,
      "height": 1,
      "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
    } , {
      headers : {
        authorization : `Bearer ${adminToken}`
      }
    })
    const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element` , {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      "width": 1,
      "height": 1,
      "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
    } , {
      headers : {
        authorization : `Bearer ${adminToken}`
      }
    })

    elementId1 = element1Response.data.id;
    elementId2 = element2Response.data.id;
  
      

    const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map` , {
      "thumbnail": "https://thumbnail.com/a.png",
      "dimensions": "100x200",
      "name": "100 person interview room",
      "defaultElements": [{
          elementId: elementId1,
          x: 20,
          y: 20
        }, {
          elementId: elementId2,
          x: 18,
          y: 20
        }
      ]
   } , {
    headers: {
      authorization: `Bearer ${adminToken}`
    }
   });

   mapId = mapResponse.data.id;
  })

  test("User is able to create a space", async () => {
    try {
        const spaceResponse = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Test",
            dimensions: "100x200",
            mapId: mapId
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        });

        expect(spaceResponse.status).toBe(200);
        expect(spaceResponse.data.spaceId).toBeDefined();
    } catch (error) {
        throw error; 
    }
});


test("User is able to create a space without mapId", async () => {
  try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
          name: "Test2",
          dimensions: "100x200"
      }, {
          headers: {
              authorization: `Bearer ${userToken}`
          }
      });
      expect(response.status).toBe(200);
      expect(response.data.spaceId).toBeDefined();
  } catch (error) {
      
      throw error; // Rethrow to fail the test
  }
});


  test("User is not able to create a space without dimensions and mapId" , async() => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space` , {
      "name": "Test",
   } , {
    headers: {
      authorization: `Bearer ${userToken}`
    }
   });

   expect(response.status).toBe(400);
   expect(response.data.spaceId).not.toBeDefined();
  });

  test("User is able to delete a space" , async() => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space` ,{
      "name": "Test",
      "dimensions": "100x200",
      "mapId": mapId
   } , {
    headers: {
      authorization: `Bearer ${userToken}`
    } });
 
    const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}` , {
      headers: {
        authorization: `Bearer ${userToken}`
      }
    })
   
    expect(deleteResponse.status).toBe(200)
  });

  test("User is not able to delete a space that does not exist" , async() => {
    const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/randomid` , {
      headers: {
        authorization: `Bearer ${userToken}`
      }
    });

    expect(deleteResponse.status).toBe(400)
  })

  test("User is not able to delete a space created by another user" , async() => {
      const response = await axios.post(`${BACKEND_URL}/api/v1/space` ,{
      "name": "Test",
      "dimensions": "100x200",
      "mapId": mapId
   } , {
    headers: {
      authorization: `Bearer ${userToken}`
    } });

  
  
    const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}` , {
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    })
    
    
    expect(deleteResponse.status).toBe(403);
  });

  test("Admin has no spaces initially" , async() => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/all` , {
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    });

    expect(response.data.spaces.length).toBe(0);
  });

  test("Admin is able to get all the spaces" , async() => {
    const spaceResponse = await axios.post(`${BACKEND_URL}/api/v1/space` , {
      "name": "Test",
      "dimensions": "100x200",
      "mapId": mapId
   } , {
    headers: {
      authorization: `Bearer ${adminToken}`
    }
   })

   const response = await axios.get(`${BACKEND_URL}/api/v1/space/all` , {
    headers: {
      authorization: `Bearer ${adminToken}`
    }
  });

    expect(response.status).toBe(200);
    expect(response.data.spaces.length).not.toBe(0);
  })
 });

describe("Arena endpoints" , () => {
  let adminId;
  let userId;
  let adminToken;
  let userToken;
  let elementId1;
  let elementId2;
  let mapId;
  let spaceId;

  beforeAll(async() => {
    const username = `ayushman${Math.random()}`;
    const password = '123456';

    const adminSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup` , {
      username , password , type: 'admin'
    });
    adminId = adminSignupResponse.data.userId;

    const adminSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin` , {
      username , password
    })
    adminToken = adminSigninResponse.data.token;

    const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup` , {
      username , password , type: 'user'
    });
    userId = userSignupResponse.data.userId;

    const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin` , {
      username , password
    })
    userToken = userSigninResponse.data.token;
    
    const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element` , {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      "width": 1,
      "height": 1,
      "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
    } , {
      headers : {
        authorization : `Bearer ${adminToken}`
      }
    })
    const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element` , {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      "width": 1,
      "height": 1,
      "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
    } , {
      headers : {
        authorization : `Bearer ${adminToken}`
      }
    })

    elementId1 = element1Response.data.id;
    elementId2 = element2Response.data.id;

   

    const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map` , {
      "thumbnail": "https://thumbnail.com/a.png",
      "dimensions": "100x200",
      "name": "100 person interview room",
      "defaultElements": [{
          elementId: elementId1,
          x: 20,
          y: 20
        }, {
          elementId: elementId2,
          x: 18,
          y: 20
        }
      ]
   } , {
    headers: {
      authorization: `Bearer ${adminToken}`
    }
   });

   mapId = mapResponse.data.id;

   const spaceResponse = await axios.post(`${BACKEND_URL}/api/v1/space` , {
    "name": "Test",
    "dimensions": "100x200",
    "mapId": mapId
 } , {
  headers: {
    authorization: `Bearer ${userToken}`
  }
 })

 spaceId = spaceResponse.data.spaceId;
  })

  test("Incorrect spaceId returns a 400" , async() => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/wrongspaceId` , {
      headers: {
        authorization: `Bearer ${userToken}`
      }
    });

    expect(response.status).toBe(400);
  });

  test("Correct spaceId returns all the elements" , async() => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}` , {
      headers: {
        authorization: `Bearer ${userToken}`
      }
    });
  
    expect(response.status).toBe(200);
    expect(response.data.dimensions).toBe("100x200");
    expect(response.data.elements.length).toBe(2);
  });

  test("Delete endpoint works as expected" , async() => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}` , {
      headers: {
        authorization: `Bearer ${userToken}`
      }
    });

    const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/element` , {
      data : {
        id: response.data.elements[0].id
      }
    , 
    headers: {
      authorization: `Bearer ${userToken}`
    }
   });

   const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
    headers: {
        authorization: `Bearer ${userToken}`
    }
    });

    expect(newResponse.data.elements.length).toBe(2)
  } )
  

  
  test("User is able to add an element" , async() => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space/element` , {
      "elementId": elementId2,
      "spaceId": spaceId,
      "x": 50,
      "y": 20
    } , {
      headers: {
        authorization: `Bearer ${userToken}`
      }
    }) 
    

    const spaceResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
      headers: {
        authorization: `Bearer ${userToken}`
      }
    })
    
    expect(spaceResponse.data.elements.length).toBe(3);
  })  
  

  test("User is not able to add the element" , async() => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space/element` , {
      "elementId": elementId2,
      "spaceId": spaceId,
      "x": 5000,
      "y": 2000
    } , {
      headers: {
        authorization: `Bearer ${userToken}`
      }
    })

    expect(response.status).toBe(400);
  })
});

  

describe("Admin endpoints" , () => {
  let adminId;
  let adminToken;
  let userId;
  let userToken;
  beforeAll(async() => {
    const username = `ayushman${Math.random()}`;
    const password = '123456';

    const adminSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup` , {
      username , password , type: 'admin'
    });
    adminId = adminSignupResponse.data.userId;
    console.log(adminId);
    

    const adminSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin` , {
      username , password
    })
    adminToken = adminSigninResponse.data.token;
    console.log(adminToken);
    

    const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup` , {
      username  : username + '-user', password , type: 'user'
    });
    userId = userSignupResponse.data.userId;
    console.log(userId);
    

    const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin` , {
      username : username + '-user' , password
    })
    userToken = userSigninResponse.data.token;
    console.log(userToken);
    
    
  })

  test("User is not able to hit the admin endpoints" , async() => {
    const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element` ,{
      imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      width: 1,
      height: 1,
      static: true // weather or not the user can sit on top of this element (is it considered as a collission or not)
    } , {
      headers: {
        authorization : `Bearer ${userToken}`
      }
    });
    
    

    const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/123456` , {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"	
    } , {
      headers : {
        authorization: `Bearer ${userToken}`
      }
    });


    const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar` , {
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
      name: "Timmy"
    } , {
      headers: {
        authorization: `Bearer ${userToken}`
      }
    });

    const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map` , {
      thumbnail: "https://thumbnail.com/a.png",
      dimensions: "100x200",
      name: "100 person interview room",
      defaultElements: [{
          elementId: "chair1",
          x: 20,
          y: 20
        }, {
          elementId: "chair2",
          x: 18,
          y: 20
        }, {
          elementId: "table1",
          x: 19,
          y: 20
        }, {
          elementId: "table2",
          x: 19,
          y: 20
        }
      ]
   } , {
    headers: {
      authorization: `Bearer ${userToken}`
    }
   })

   expect(elementResponse.status).toBe(403);
   expect(updateElementResponse.status).toBe(403);
   expect(avatarResponse.status).toBe(403);
   expect(mapResponse.status).toBe(403);
  });

  test("Admin is able to hit the admin endpoints" , async() =>{
    const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element` , {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      "width": 1,
      "height": 1,
      "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
    } , {
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    });

    const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar` , {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
      "name": "Timmy"
    } , {
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    });

    const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map` , {
      "thumbnail": "https://thumbnail.com/a.png",
      "dimensions": "100x200",
      "name": "100 person interview room",
      "defaultElements": []
   } ,{
    headers: {
      authorization: `Bearer ${adminToken}`
    }
  });

  expect(elementResponse.status).toBe(200);
  expect(avatarResponse.status).toBe(200);
  expect(mapResponse.status).toBe(200);
  });

  test("Admin is able to update the element" , async() => {
    const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element` , {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      "width": 1,
      "height": 1,
      "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
    } , {
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    });
    
    console.log(elementResponse.data);
    

    const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/${elementResponse.data.id}` , {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"	
    } , {
      headers : {
        authorization : `Bearer ${adminToken}`
      }
    })

    expect(updateElementResponse.status).toBe(200)
});
});

describe("Websockets endpoints" , () => {
  let adminId;
  let userId;
  let adminToken;
  let userToken;
  let elementId1;
  let elementId2;
  let mapId;
  let spaceId;
  let ws1;
  let ws2;
  let ws1Messages = [];
  let ws2Messages = [];

  function waitForAndPopLatestMessage(messageArray) {
    return new Promise(resolve => {
      if(messageArray.length > 0){
        resolve(messageArray.shift())
      } else {
        let interval = setTimeout(() => {
          if(messageArray.length > 0){
            resolve(messageArray.shift());
            clearInterval(interval);
          }
        } , 100)
      }
    })
  }

  async function setupHTTP() {
    const username = `ayushman${Math.random()}`
    const password = "123456"
    const adminSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        username,
        password,
        type: "admin"
    })

    const adminSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
        username,
        password
    })

    adminUserId = adminSignupResponse.data.userId;
    adminToken = adminSigninResponse.data.token;
    
    
    const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        username: username + `-user`,
        password,
        type: "user"
    })
    const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
        username: username + `-user`,
        password
    })
    userId = userSignupResponse.data.userId
    userToken = userSigninResponse.data.token
    
    const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
        "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        "width": 1,
        "height": 1,
      "static": true
    }, {
        headers: {
            authorization: `Bearer ${adminToken}`
        }
    });

    const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
        "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        "width": 1,
        "height": 1,
      "static": true
    }, {
        headers: {
            authorization: `Bearer ${adminToken}`
        }
    })
    elementId2 = element2Response.data.id
    elementId1 = element1Response.data.id

    const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
        "thumbnail": "https://thumbnail.com/a.png",
        "dimensions": "100x200",
        "name": "Defaul space",
        "defaultElements": [{
                elementId: element1Id,
                x: 20,
                y: 20
            }, {
              elementId: element1Id,
                x: 18,
                y: 20
            }, {
              elementId: element2Id,
                x: 19,
                y: 20
            }
        ]
     }, {
        headers: {
            authorization: `Bearer ${adminToken}`
        }
     })
     mapId = mapResponse.data.id

    const spaceResponse = await axios.post(`${BACKEND_URL}/api/v1/space`, {
        "name": "Test",
        "dimensions": "100x200",
        "mapId": mapId
    }, {headers: {
        "authorization": `Bearer ${userToken}`
    }})

   
    spaceId = spaceResponse.data.spaceId
}

  async function setupWs() {
    ws1 = new WebSocket(WS_URL);
    
    ws1.onmessage(event => {
      ws1Messages.push(JSON.parse(event.data))
    });

    await new Promise(r => {
      ws1.onopen = r;
    });

    ws2 = new WebSocket(WS_URL);
    
    ws2.onmessage(event => {
      ws2Messages.push(JSON.parse(event.parse))
    });
    await new Promise(r => {
      ws2.onopen = r;
    });
  };

 beforeAll(async() => {
  await setupHTTP();
  await setupWs();
 });

  test("Get back acknowledgement for joining the space" , async() => {
    ws1.send(JSON.stringify({
      "type": "join",
      "payload": {
        "spaceId": spaceId,
        "token": adminToken
      }
  }))
    const message1 =await waitForAndPopLatestMessage(ws1Messages)

    ws2.send(JSON.stringify({
      "type": "join",
      "payload": {
        "spaceId": spaceId,
        "token": userToken
      }
  }))
    const message2 = await waitForAndPopLatestMessage(ws2Messages);
    const message3 = await waitForAndPopLatestMessage(ws1Messages);
    

    expect(message1.type).toBe("space-joined");
    expect(message2.type).toBe("space-joined");
    expect(message1.payload.users.length).toBe(0);
    expect(message2.payload.users.length).toBe(1);
    expect(message3.type).toBe("user-joined");
    expect(message3.payload.userId).toBe(userId);
    expect(message3.payload.x).toBe(message2.payload.spawn.x);
    expect(message3.payload.y).toBe(message2.payload.spawn.y);

    adminX = message1.payload.spawn.x;
    adminY = message1.payload.spawn.y;

    userX = message2.payload.spawn.x;
    userY = message2.payload.spawn.y;
  });

  test("User should not be able to move beyond the boundaries" , async() => {
    ws1.send(JSON.stringify({
      "type": "move",
      "payload": {
        "x": 2000,
        "y": 3000
      }
  }));

  const message = await waitForAndPopLatestMessage(ws1Messages);

  expect(message.type).toBe("movement-rejected");
  expect(message.payload.x).toBe(adminX);
  expect(message.payload.y).toBe(adminY);
  });

  test("User should not be able to move 2 block at the same time" ,async() => {
    ws1.send(JSON.stringify({
      "type": "move",
      "payload": {
        "x": adminX + 2,
        "y": 3
      }
  }));

  const message = await waitForAndPopLatestMessage(ws1Messages);

  expect(message.type).toBe("movement-rejected");
  expect(message.payload.x).toBe(adminX);
  expect(message.payload.y).toBe(adminY);
  });

  test("Correct movement should be broadcasted to the other users", async() => {
    ws1.send(JSON.stringify({
      "type": "move",
      "payload": {
        "x": adminX + 1,
        "y": 3,
        userId: adminId
      }
  }));

  const message = await waitForAndPopLatestMessage(ws1Messages);
  expect(message.type).toBe("movement");
  expect(message.payload.x).toBe(adminX+1);
  expect(message.payload.y).toBe(adminY);
  });

  test("If a user leaves then other users should receive a leave event" , async() => {
    ws1.close();
    const message = await waitForAndPopLatestMessage(ws1Messages);
    expect(message.type).toBe("user-left");
    expect(message.payload.userId).toBe(adminId)
  })
});