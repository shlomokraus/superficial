<img align="left" width="100" height="100" src="https://raw.githubusercontent.com/shlomokraus/superficial/master/static/logo.png">

# superficial

*A GitHub ([Probot](https://github.com/probot/probot)) app that blocks and fixes superficial pull requests*

# Introduction

Code review is a tedious task. It is more frustrating to find files that only have formatting updates without a change to functionality - those are **superficial changes**. 

There are many reasons why this happens - a developer might have an automatic formatter on his IDE, he might started editing a file and stopped without reverting all changes and many more. No matter the reason, this makes the code review task even harder and also makes it difficult to track changes in the commit log. 

Formatting changes should only be allowed in files that have actuall functionality change. A formatting only change should be submitted in its own pr. 

## This bot can: 
1. Post status message indicating the PR contains superficial updates.
2. Post comment listing the problematic files.
3. Automatically revert to base all superficial files.

## How does it work? 
This bot has a three step process to determine superficial updates: 
1. Pull base and head version of the file.
2. Run [Prettier](https://github.com/prettier/prettier) to match the basic formatting. 
3. Parse the context to AST (abstract syntax tree) using [@babel/parser](https://babeljs.io/docs/en/babel-parser) and compare the results. 

This gives us high accuracy since it ignores any change that doesn't affect the AST of the code. 

## Supported files
- Javascript (.js, .jsx)
- Typescript (.ts, .tsx)
- Comming soon: css

## Setup

1. Setup environment variables as explained in [the Probot guide](https://probot.github.io/docs/development/)
2. Install with `yarn install` 
3. Build with `yarn run build`
4. And fire away `yarn run start`

Run tests: 
`yarn run test`

## Contributing

If you have suggestions for how superficial could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2018 Shlomo Kraus
