# API Endpoints

## Users
We support these user endpoints.

`POST /user/authenticate`
- Authenticates a user and returns the user model with a JWT:
```
{
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    organizationId: string,
    role: string,
    image?: string,
    ownedFiles: string[],
    starredFiles: string[],
    recentFiles: string[],
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
    password: string,
    organizationId: string,
    role?: string, one of ['admin', 'member']
 }
```

**All the routes below require authorization with a JWT Bearer Token.**

`GET /user/all`
- Gets all the user in the database.

`GET /user/current`
- Gets the current user's user model:
```
{
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    organizationId: string,
    role: string,
    image?: string,
    ownedFiles: string[],
    starredFiles: string[],
    recentFiles: string[],
    createdAt: string,
    updatedAt: string,
}
```

`GET /user/:id`
- Gets a user model by user id

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
We support these organization endpoints.

`POST /organization/create`
- Creates a new organization
- The following body is required:
```
{
    name: string,
}
```

The below routes require authorization with a JWT token in the _.

`GET /organization`
- Gets all the organizations in the database (for testing).

## Files
We support these organization endpoints. All the routes require authorization with a JWT bearer token.

`POST /file/upload`
- Uploads a new file to S3`
- You must send FormData with the following fields:  
```
{
    file: File
}
```

`GET /file/:id`
- Gets a file model by file id:
```
{
    id: string,
    name: string,
    type?: string,
    lastUpdater: string,
    createdAt: string,
    updatedAt: string,
}
```

`GET /file/all`
- Gets all files in the database (for testing).


`GET /file/access/:id`
- Gets a file model, a url to display it (expires in 10 minutes), and the file object from S3.
- This requires viewing permissions.
- This method returns
```
{
    id: string,
    name: string,
    type?: string,
    lastUpdater: string,
    createdAt: string,
    updatedAt: string,
    url: string,
    object: {
        ContentLength: int,
        ContentType: string,
        LastModified: string,
        Body: {
            type: string,
            data: int[]
        }
        // some other stuff
    }
}
```