const axios = require("axios");

const cachedData = {
    data: [],
    lastCachedTime: NaN,
}


module.exports = async function (req, res) {
    // Check if we have cache from the last hour
    if (Number.isInteger(cachedData.lastCachedTime) && cachedData.lastCachedTime > (+new Date()) - 60 * 15 * 1000) {
        res.json({success: true, issues: cachedData.data});

        return;
    }


    try {
        // Setting environment variables.
        const githubToken = req.variables['GITHUB_TOKEN'] ?? '';
        const repos = (req.variables['GITHUB_REPOS'] ?? '').split('|');

        if (githubToken === '' || repos.length < 1) {
            throw new Error('Missing env variables');
        }

        cachedData.data = await allIssues(repos, githubToken);
        cachedData.lastCachedTime = +new Date();

        res.json({success: true, issues: cachedData});
    } catch (e) {
        res.json({success: false, message: e.message});
    }
};

async function allIssues(repos, githubToken) {
    const issues = [];

    let page = 1;

    while (true) {
        const fetchedIssues = await fetchIssues(searchUrl(repos.join('+repo:'), page), githubToken);

        if (fetchedIssues === null) {
            throw new Error('Error while fetching from Github');
        }

        (fetchedIssues.items ?? []).forEach(i => issues.push(i));

        if (Math.ceil(fetchedIssues.total_count / 100) <= page++ || page >= 11) {
            break;
        }
    }

    const featuresList = [];

    issues.filter((item) => {
        return item.labels.filter((label) =>
            label.name === 'feature' ||
            label.name === 'enhancement').length !== 0 || item.title.includes('Feature') || item.title.includes('Feat');
    }).forEach((k) => {
        featuresList.push({
            // body: k.body,
            repo: k.repository_url.replace('https://api.github.com/repos/', ''),
            title: k.title,
            url: k.html_url,
            total: k.reactions['+1'],
            comments: k.comments,
            user: {
                username: k.user.login,
                link: k.user.html_url
            }
        });
    });

    return featuresList.sort(byCount);

}

async function fetchIssues(url, token) {
    try {
        const res = await axios.get(url, {headers: {'Authorization': `Bearer ${token}`}})

        return res.data;
    } catch (e) {
        console.log(e);
        return null;
    }
}

function byCount(a, b) {
    if (a.total > b.total) {
        return -1;
    }
    if (a.total < b.total) {
        return 1;
    }
    return 0;
}

function searchUrl(repos, page = 1) {
    return `https://api.github.com/search/issues?q=type:issue+state:open+repo:${repos}&page=${page}&per_page=100`;
}