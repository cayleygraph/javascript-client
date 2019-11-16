import path = require("path");
import fs = require("fs");
import ts = require("typescript");
const headerFile = path.join(path.dirname(__filename), "header.ts");
const code = fs.readFileSync(headerFile, "utf-8");

const sourceFile = ts.createSourceFile(
  "path.ts",
  code,
  ts.ScriptTarget.Latest,
  true
);
// const classDeclaration = ts.createClassDeclaration([], [], "Path", [], [], []);
const pathClass = sourceFile.statements[sourceFile.statements.length - 1];
if (
  !(ts.isClassDeclaration(pathClass) && pathClass.name.escapedText === "Path")
) {
  throw new Error(`Unexpected statement: ${pathClass}`);
}
const newMembers = [
  ...pathClass.members,
  ts.createMethod(
    [],
    [],
    undefined,
    "v",
    undefined,
    [],
    [],
    ts.createTypeReferenceNode(pathClass.name, []),
    ts.createBlock([ts.createReturn(ts.createThis())])
  )
];
const newPathClass = ts.createClassDeclaration(
  pathClass.decorators,
  pathClass.modifiers,
  pathClass.name,
  pathClass.typeParameters,
  pathClass.heritageClauses,
  newMembers
);

const newSourceFile = ts.createSourceFile(
  sourceFile.fileName,
  sourceFile.text,
  ts.ScriptTarget.Latest,
  /*setParentNodes*/ false,
  ts.ScriptKind.TS
);
const printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed
});

const result = printer.printList(
  ts.ListFormat.SourceFileStatements,
  ts.createNodeArray(
    [
      ...sourceFile.statements.slice(0, sourceFile.statements.length - 1),
      newPathClass
    ],
    false
  ),
  newSourceFile
);
fs.writeFileSync("path.ts", result);
