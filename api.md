# API Endpoints

## Users
We support these user endpoints.

`POST /users/authenticate`
- Authenticates a user and returns
```
{

}
```
- The following body is required
```
{
    email: string,
    password: string
 }
```

`POST /users/register`  
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

**All the routes below require authorization with a JWT token in the _.**

`GET /users`
- Gets all the users in the database.

`GET /users/current`
- Gets the current user's user model:
```
{

}
```

`GET /users/:id`
- Gets a user model by user id:

`PUT /users/:id`
- Updates the user model with the given user id and returns the user's model.
- The following body is required:
```
{
    firstName?: string,
    lastName?: string,
    password?: string
}
```

`DELETE /users/:id`
- Deletes the user with the given user id and returns
```
{ 
    message: 'User deleted successfully' 
}
```

## Organizations
We support these organization endpoints. All the routes require authorization with a JWT token in the _.

`POST /organizations`
- Creates a new organization
- The following body is required:
```
{
    name: string,
}
```

## Files
We support these organization endpoints. All the routes require authorization with a JWT token in the _.

`POST /files
- Uploads a new file to S3`
- The following body is required:
```
{

}
```

`GET /files`
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
