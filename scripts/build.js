const { green, cyan, red } = require("chalk");
const webpack = require("webpack");

const path = require("path");
const fs= require("fs");
const fse = require("fs-extra");
const execa = require("execa");
// const cherryPick = require("../config/cherry-picker").default;
const styleConfig = require("../config/style.webpack.config");

const root = path.join(__dirname, "../");
const srcRoot = path.join(__dirname, "../src/components");
const typesRoot = path.join(__dirname, "../types");
const libRoot = path.join(__dirname, "../lib");
const styleRoot = path.join(libRoot, "/dist");
const cjsRoot = path.join(libRoot, "cjs");
const esRoot = path.join(libRoot, "esm");

const clean = () => fse.existsSync(libRoot) && fse.removeSync(libRoot);

const promise = (name, callback) => async () => {
  console.log(cyan("Pending: ") + green(name));
  await callback();
  console.log(cyan("Done: ") + green(name));
};

const shell = (cmd) =>
  execa(cmd, { stdio: ["pipe", "pipe", "inherit"], shell: true });

const generatingModuleDeclaration = promise("generating lib/index.d.ts base on root index.d.ts and types/index.d.ts combined", () => {
  const componentType = fs.readFileSync(`${typesRoot}/index.d.ts`); 
  // This text will be written on file input.text 
  const declaration = fs.readFileSync(`${root}/index.d.ts`)
  // write file declaration lib/index.d.ts
  fs.writeFileSync(`${libRoot}/index.d.ts`, `${declaration}\n${componentType}`.replace(/\.\//g, './esm/')); 
});

const buildTypes = promise("generating components ts declarations", () =>
  shell(`yarn build-types`)
);

const copyTypes = (dest) =>
  shell(`yarn babel ${typesRoot} -d ${dest} --copy-files`);

const babel = (outDir, envName) =>
  shell(
    // `yarn babel ${srcRoot} -x .ts,.tsx --out-dir ${outDir} --copy-files --env-name "${envName}"`
    `yarn babel ${srcRoot} -x .ts,.tsx --out-dir ${outDir}`
  );

const buildLib = promise("compile commonjs modules", async () => {
  await babel(cjsRoot, "cjs");
  await copyTypes(cjsRoot);
});

const buildEsm = promise("compile esm modules", async () => {
  await babel(esRoot, "esm");
  await copyTypes(esRoot);
});

const copyREADME = promise("copying README.md", async () => {
  fs.copyFileSync(path.join(root, "README.md"), path.join(libRoot, "README.md"))
});

const cleanPackageJSON = promise("striping package.json and moving it to /lib", async () => {
  const json = fs.readFileSync(path.join(root, "package.json"), "utf8");
  const { devDependencies, scripts, ...package } = JSON.parse(json)
  fs.writeFileSync(path.join(libRoot, "package.json"), JSON.stringify(package, null, 2), 'utf8');
});

const buildStyle = promise(
  "compile web designer plugins",
  () =>
    new Promise((resolve, reject) => {
      webpack([styleConfig(styleRoot)], async (err, stats) => {
        if (err || stats.hasErrors()) {
          reject(err || stats.toJson().errors);
          return;
        }

        resolve();
      });
    })
);

// const buildDirectories = promise("connecting exposed directories in modules", () =>
//   cherryPick({
//     inputDir: "../src/components",
//     cjsDir: "cjs",
//     esmDir: "esm",
//     typesDir: "esm",
//     cwd: libRoot,
//   })
// );

clean();

Promise.resolve(true)
  .then(buildTypes)
  .then(() => Promise.all([
      buildLib(), 
      buildEsm(), 
      // we don't have scss or css so to prevent error need to comment
      // buildStyle() 
  ]))
  .then(generatingModuleDeclaration)
  .then(copyREADME)
  .then(cleanPackageJSON)
  // .then(buildDirectories) /*remove cherry pick because it is only direct module without folders module*/
  .catch((err) => {
    if (err) console.error(red(err.stack || err.toString()));
    process.exit(1);
  });
