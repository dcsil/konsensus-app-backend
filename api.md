# API Endpoints

## Users
We support these user endpoints.

`POST /user/authenticate`
- Authenticates a user and returns the user model with a JWT and organization info.
- 
- The following body is required
```
{
    email: string,
    password: string
 }
```

`POST /user/register`  
- Registers the user and returns the new user model.
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
- Gets the current user's user model and organization info:
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
    organization: {
        id: string,
        name: string,
        image: string,
        createdAt: string,
        updatedAt: string
    },
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

`PUT /image`
- Updates the profile picture of the current user.
- You must send FormData with the following fields:  
```
{
    file: File
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

`PUT /image`
- Updates the profile picture of the current user's organization.
- You must send FormData with the following fields:  
```
{
    file: File
}
```

## Files
We support these file endpoints. All the routes require authorization with a JWT bearer token.

`POST /file/upload`
- Uploads a new file to S3
- You must send FormData with the following fields:  
```
{
    file: File
}
```

`PUT /file/:id`
- Updates the file with the given file ID.
- You must send FormData with the following fields:  
```
{
    file: File
}
```

`PUT /file/star/:id`
- If the file is currently un-starred, this method will star the file and return:
```
{
    "message": "Successfully starred file."
}
```
- If the file is currently starred, this method will un-star the file and return:
```
{
    "message": "Successfully unstarred file."
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
- Gets all files that the user can view.


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

`GET /file/owned`
- Gets the file models of the user's owned files.
  
`GET /file/recent`
- Gets the file models of the user's recent files.

`GET /file/starred`
- Gets the file models of the user's starred files.


## Permissions
We support these permission endpoints. All the routes require authorization with a JWT bearer token.

`PUT /permission/:fileId/:userId`
- Creates or updates the permissions for the corresponding file and user.
- The user making this call must have edit or admin access to the file.
The following body is required:
```
{
    canView?: boolean,
    canEdit?: boolean,
    canShare?: boolean,
    isAdmin?: boolean,
}
```
If a new permission model is created, returns:
```
{
    message: Permission created.
}
```
If an existing permission is updated, returns:
```
{
    message: Permission updated.
}
```

`GET /permission/:fileId/:userId`
- Gets the permission model for the corresponding file and user:
```
{
    fileId: string,
    userId: string,
    canView: boolean,
    canEdit: boolean,
    canShare: boolean,
    isAdmin: boolean,
    createdAt: string,
    updatedAt: string
}
```

## Links

Links are used to support permission sharing. We support these routes.

`GET /link/:shareToken`
- Returns the link object associated with the shareToken, as well as a presigned S3 URL to the file.
- Does not require authorization.

The following routes require authorization with a JWT bearer token.

`POST /link/share`
- Creates a new link object, which is identified by a share token that can be given to an external collaborator.
- Requires the following body:
``` 
{
    fileID: string,
    email: string
}
```
- Returns:
```
{
    shareToken: string
}