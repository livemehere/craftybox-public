import 'dotenv/config';

const config = {
  appId: 'com.livemehere.craftyBox',
  productName: 'CraftyBox',
  artifactName: '${productName}-${version}-${os}.${ext}',
  directories: {
    output: 'release/${version}',
  },
  files: ['dist'],
  nsis: {
    deleteAppDataOnUninstall: true,
  },
  publish: {
    provider: 'github',
    owner: 'livemehere',
    repo: 'crafty-box-official',
    token: process.env.GITHUB_TOKEN,
  },
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64'],
      },
    ],
    icon: 'assets/icons/icon.ico',
  },
  mac: {
    target: [
      {
        target: 'default',
        arch: ['arm64'],
      },
    ],
    icon: 'assets/icons/icon.png',
  },
};

export default config;
