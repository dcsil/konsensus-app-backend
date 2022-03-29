# API Endpoints

## Users
We support these user endpoints.

`POST /user/authenticate`
- Authenticates a user and returns
```
{
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    createdAt: string,
    updatedAt: string,
    token: string
}
```
- The following body is required
```
{
    email: string,
    password: string
 }
```

`POST /user/register`  
- Registers the user and returns:
```
{
    message: 'Registration successful'
}
```
- The following body is required
```
{
    firstName: string,
    lastName: string,
    email: string,
    password: string
 }
```

**All the routes below require authorization with a JWT Bearer Token.**

`GET /user`
- Gets all the user in the database.

`GET /user/current`
- Gets the current user's user model:
```
{

}
```

`GET /user/:id`
- Gets a user model by user id:

`PUT /user/:id`
- Updates the user model with the given user id and returns the user's model.
- The following body is required:
```
{
    firstName?: string,
    lastName?: string,
    password?: string
}
```

`DELETE /user/:id`
- Deletes the user with the given user id and returns
```
{ 
    message: 'User deleted successfully' 
}
```

## Organizations
We support these organization endpoints. All the routes require authorization with a JWT token in the _.

`POST /organization`
- Creates a new organization
- The following body is required:
```
{
    name: string,
}
```

## Files
We support these organization endpoints. All the routes require authorization with a JWT bearer token.

`POST /file
- Uploads a new file to S3`
- You must send FormData with the following fields:  
```
{
    file: File
}
```

`GET /file`
- Gets the files pertaining to a user:
```
{
    owned: [],
    shared_with: [],
    starred: []
}
```
- The following body is required:
```
{
    user_id: int
}
