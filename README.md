# Task-Manager-API

### In simple, this app is an app which you can create an account in it, and then make a list of task you have finished or have not finished, and also you can upload a profile picture
<br>

### It uses authorization token to verify an account

### This is a back-end API made using many node packages:
* mongoDB & mongoose
* express
* bcryptjs
* JWT (json web token)
* multer
* sharp
* etc

### Actually it has email sign notification when you sign up or delete an account, but since it needs a pro-email, i only include it in the comment, but not in real live version 

### In this repo also included a test case for weather the apps run smoothly or not


### It is deployed using heroku and the mongoDB database is hosted using free mongoAtlas account 
**[Task-Manager-API](https://ikram-maududi-task-manager.herokuapp.com)**


## These are all routes & what to fill in it
### POST method
* create a user (POST) '{{url}}/users'
```js
{ 
    "name" : "reigan",
    "email" : "kurama@example.com",
    "password": "hie12345",
    "age": "32"
}
```
* Login a user (POST) '{{url}}/users/login'
```js
{
    "email" : "satu@dua.com",
    "password": "abcd36754"
}
```
* Logout a user (current session) (POST) '{{url}}/users/logout'
* Logout a user (all sessions)  (POST) '{{url}}/users/logoutAll'

* Create a task  (POST) '{{url}}/tasks'
```js
{
    "description": "travel to teach people",
    "completed": false
}
```
<br>

### GET method
* Read a profile  (GET) '{{url}}/users/me'
* Read all tasks  (GET) '{{url}}/tasks'
* Read a task  (GET)  '{{url}}/:taskid'

### PATCH method
* Update a user (PATCH)  '{{url}}/users/:userid'
* Update a task (PATCH)  '{{url}}/users/:taskid'

### DEL method
* Delete a user (DEL) '{{url}}/users/me'
* Delete a task (DEL) '{{url}}/task/:taskid'

### avatar
* Upload avatar (POST) '{{url}}/users/me/avatar'
* Delete avatar (DEL) '{{url}}/users/me/avatar'


