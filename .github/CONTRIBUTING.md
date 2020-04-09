# Contribute to Trinity

This document describes how to contribute to Trinity.

We encourage everyone with knowledge of IOTA technology to contribute.

Thanks! :heart:

<details>
<summary>Do you have a question :question:</summary>
<br>

If you have a general or technical question, you can use one of the following resources instead of submitting an issue:

- [**Developer documentation:**](https://docs.iota.org/) For official information about developing with IOTA technology
- [**Discord:**](https://discord.iota.org/) For real-time chats with the developers and community members
- [**IOTA cafe:**](https://iota.cafe/) For technical discussions with the Research and Development Department at the IOTA Foundation
- [**StackExchange:**](https://iota.stackexchange.com/) For technical and troubleshooting questions
</details>

<br>

<details>
<summary>Ways to contribute :mag:</summary>
<br>

To contribute to Trinity on GitHub, you can:

- Report a bug
- Suggest a new feature
- Build a new feature
- Contribute to the documentation

</details>

<br>

<details>
<summary>Report a bug :bug:</summary>
<br>

This section guides you through reporting a bug. Following these guidelines helps maintainers and the community understand the bug, reproduce the behavior, and find related bugs.

### Before reporting a bug

Please check the following list:

- **Do not open a GitHub issue for [security vulnerabilities](SECURITY.MD)**, instead, please submit a report to our [Bugcrowd program](https://bugcrowd.com/iota).

- **Ensure the bug was not already reported** by searching on GitHub under [**Issues**](https://github.com/iotaledger/trinity/issues). If the bug has already been reported **and the issue is still open**, add a comment to the existing issue instead of opening a new one.

**Note:** If you find a **Closed** issue that seems similar to what you're experiencing, open a new issue and include a link to the original issue in the body of your new one.

### Submitting A Bug Report

To report a bug, [open a new issue](https://github.com/iotaledger/trinity-wallet/issues/new?labels=T+-+Bug&template=bug_report.md&title=), and be sure to include as many details as possible, using the template.

**Note:** You don't need to open an issue for minor changes such as typos, but you can if you want.

If you also want to fix the bug, submit a [pull request](#pull-requests) and reference the issue.
</details>

<br>

<details>
<summary>Suggest a new feature :bulb:</summary>
<br>

This section guides you through suggesting a new feature. Following these guidelines helps maintainers and the community collaborate to find the best possible way forward with your suggestion.

### Before suggesting a new feature

**Ensure the feature has not already been suggested** by searching on GitHub under [**Issues**](https://github.com/iotaledger/trinity/issues).

### Suggesting a new feature

To suggest a new feature, talk to the IOTA community and IOTA Foundation members in the #trinity-discussion channel on [Discord](https://discord.iota.org/).

If the Trinity team approves your feature, you can create an issue for it.
</details>

<br>

<details>
<summary>Build a new feature :hammer:</summary>
<br>

This section guides you through building a new feature. Following these guidelines helps give your feature the best chance of being approved and merged.

### Before building a new feature

Make sure to discuss the feature in the #trinity-discussion channel on [Discord](https://discord.iota.org/).

Otherwise, your feature may not be approved at all.

### Building a new feature

To build a new feature, check out a new branch based on the `develop` branch, and be sure to consider the following:

- Make sure that your feature is supported on mobile and desktop devices

- If the feature includes public-facing text, make sure to follow the [localization instructions](/docs/dev/localisation.md)
</details>

<br>

<details>
<summary>Contribute to the documentation :black_nib:</summary>
<br>

The Trinity documentation is hosted on https://docs.iota.org, which is built from content in the [documentation](https://github.com/iotaledger/documentation) repository.

Please see the [guidelines](https://github.com/iotaledger/documentation/CONTRIBUTING.md) on the documentation repository for information on how to contribute to the documentation.
</details>

<br>

<details>
<summary>Pull requests :mega:</summary>
<br>

This section guides you through submitting a pull request (PR). Following these guidelines helps give your PR the best chance of being approved and merged.

### Before submitting a pull request

When creating a pull request, please follow these steps to have your contribution considered by the maintainers:

- A pull request should have exactly one concern (for example one feature or one bug). If a PR addresses more than one concern, it should be split into two or more PRs.

- A pull request can be merged only if it references an open issue

    **Note:** Minor changes such as fixing a typo can but do not need an open issue.

- All code should be well tested and follow the [code styleguide](/docs/dev/styleguide.md)

### Submitting a pull request

The following is a typical workflow for submitting a new pull request:

1. Fork this repository
2. Create a new branch based on your fork

    Use one of the following prefixes to name your branch:
    
    - `bug`
    - `feat`
    - `chore`
    - `hotfix`
    
    For example, if you're building an awesome new feature, you might name your branch `feat/my-awesome-new-feature`. 

3. Commit changes and push them to your fork
4. Create a pull request against the `develop` branch

Never create pull requests against the `master` branch unless you're trying to merge an important hotfix.

If all [status checks](https://help.github.com/articles/about-status-checks/) pass, and the maintainer approves the PR, it will be merged.

**Note:** Reviewers may ask you to complete additional work, tests, or other changes before your pull request can be approved and merged.
</details>

<br>

<details>
<summary>Code of Conduct :clipboard:</summary>
<br>

This project and everyone participating in it is governed by the [IOTA Code of Conduct](CODE_OF_CONDUCT.md).
</details>
