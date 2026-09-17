const fs = require("fs");
const path = require("path");

const repositoryRoot = path.join(__dirname, "..");

async function prepare() {
  if (!fs.existsSync(path.join(repositoryRoot, ".git"))) {
    return;
  }

  process.chdir(repositoryRoot);
  const { default: husky } = await import("husky");
  process.stdout.write(husky());
}

prepare().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
