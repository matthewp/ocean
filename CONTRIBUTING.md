# Contributing to this repository

__Ocean__ is a runtime agnostic library for rendering web component code to HTML. However the library is developed using [Deno](https://deno.land/) tooling.

## Prerequisites

1. A recent version of [Deno](https://deno.land/#installation).
2. That's it! Deployment happens in CI so you don't need anything special for that.

## Creating a release

Ocean is hosted on a custom CDN that is deployed in a GitHub Action whenever a *tag* is created.

You can create a new version through the GitHub Actions UI if you have the right permissions.

1. Go to the __Actions__ tab in the *matthewp/ocean* repo.
2. Select __Create version__ from the left side.

    ![Clicking the Create version link](https://user-images.githubusercontent.com/361671/132341418-61273c13-480b-4947-b9a5-af09744270f9.png)

3. Find the __Run workflow__ drop down and click it.

    ![Finding the Run workflow dropdown](https://user-images.githubusercontent.com/361671/132341485-b2cb25ad-36d2-46a8-89e7-6eda503d7efe.png)

4. Type in the version you want to create and then click __Run workflow__.

    ![Typing in the version and then running the workflow](https://user-images.githubusercontent.com/361671/132341521-3d5fa528-1594-470b-b56a-767768e3604e.png)
