import type {Config} from 'release-it';

export default {
    git: {commitMessage: 'chore: release ${version}', tagName: 'v${version}'},
    npm: {publish: true},
    github: {release: true},
    plugins: {'@release-it/conventional-changelog': {preset: 'angular'}},
} satisfies Config;
