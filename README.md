# Fish Shrimp Crab Backend

Author: Fergus Lai

Backend Build With Typescript, Prisma, Socket.io As The Backend For The Fish Shrimp Crab Project, Connecting To PostgreSQL. 

[Frontend Repo](https://github.com/Fergus-Lai/fishShrimpCrabFrontend)

-----
### Index
* [Technology Used](#technology) 
* [API](#api)
-----

### Technology
* Language - Typescript
* ORM - Prisma
* Socket.io
-----
### API
-----
#### Event Recevied

##### createTable

Data: userId, userName, code, icon

Use: Create Table In Database and Create or Update User

##### joinTable

Data: userId, userName, code, icon

Use: Check if Table In Database and Create or Update User

##### disconnect

Use: Delete The User Immediately If The User Is Not In A Table, Else Delete After 300000ms

##### loading

Data: userId, id

Use: Return Required Data For Board Page

-----

#### Event Emitted

##### joined

Use: Communicate with Client To Change Page To Board

##### tableDuplicate

Use: Communicate with Client To Show Error Of noTable to Join

##### noTable

Use: Communicate with Client To Show Error Of noTable to Join

##### loaded

Data: money, icon, username, users

Use: Send Data Required For Board Page to User

##### playerJoined

Data: id, money, icon, username

Use: Update Users List For All User In The Table

##### tableIdNotMatch

Use: Communicate with User The Table ID Send Do Not Match Database

##### tableNotFound

Use: Communicate with User The Table Do Not Exists

##### userNotFound

Use: Communicate with User The User Do Not Exists in Database