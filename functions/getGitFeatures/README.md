# Get Git Features

This function is designed to retrieve all issues from a list of repositories. Its purpose is to identify issues that are categorized as `Feature requests.`

## Environment Variables

If a GitHub token is not provided, the request rate will be limited to 10 requests per minute. However, with a valid token, the request rate can be increased to 30 requests per minute. It is important to note that the function mentioned here requires a valid token to function properly. This information is provided for your reference.

Please be aware that the GitHub search endpoint has a limitation of 1000 search results. Consequently, only the first 1000 issues will be fetched.

You can set these variables. _You can see an example in the `.env.example` file_

- `GITHUB_TOKEN` - Github token for fetching the issues.
- `GITHUB_REPOS` - List of project repos seperated by the pipeline character `|`.

## In-RAM variable

The function utilizes an in-memory variable, which implies that the result will be stored within the RAM memory of the available cloud function.

```javascript
const cachedData = {
    data: [...],
    lastCachedTime: 1684895913,
}

if (Number.isInteger(cachedData.lastCachedTime) && cachedData.lastCachedTime < (+new Date()) - 60 * 60 * 1000) {
    return cachedData.data;
}
```

By doing this, any request made within 15 minutes of the last retrieval will be significantly faster, as the result will be retrieved directly from the RAM, ensuring quicker response times.

### Read more

This function uses:

- Appwrite [Function](https://appwrite.io/docs/functions).
- [Node](https://nodejs.org/en)
- Github [Search](https://docs.github.com/en/rest/search?apiVersion=2022-11-28) API