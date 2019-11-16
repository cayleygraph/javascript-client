import path = require("path");
import fs = require("fs");
import ts = require("typescript");
import prettier = require("prettier");
import * as schema from "./schema.json";
const headerFile = path.join(path.dirname(__filename), "header.ts");
const code = fs.readFileSync(headerFile, "utf-8");

const sourceFile = ts.createSourceFile(
  "path.ts",
  code,
  ts.ScriptTarget.Latest,
  true
);

const pathClass = sourceFile.statements[sourceFile.statements.length - 1];
if (
  !(ts.isClassDeclaration(pathClass) && pathClass.name.escapedText === "Path")
) {
  throw new Error(`Unexpected statement: ${pathClass}`);
}

type SchemaObject = {
  "@id": string;
};

type Restriction = SchemaObject & {
  "@type": "owl:Restriction";
  "owl:cardinality"?: number;
  "owl:maxCardinality"?: number;
  "owl:onProperty"?: SchemaObject;
};

type BaseStep = SchemaObject & {
  "@type": "rdfs:Class";
  "rdfs:subClassOf": Array<SchemaObject | Restriction>;
};

type BaseProperty = SchemaObject & {
  "@type": "owl:ObjectProperty" | "owl:DatatypeProperty";
  /** @todo this is invalid domain should receive { @id: string } */
  "rdfs:domain":
    | string
    | {
        "@id": string;
        "@type": "owl:Class";
        "owl:unionOf": {
          "@id": string;
          "@list": BaseStep[];
        };
      };
  /** @todo this is invalid range should receive { @id: string } */
  "rdfs:range": string;
};

const rangeToType = (range: string) => {
  const rangeID = range;
  if (rangeID === "linkedql:PathStep") {
    return ts.createTypeReferenceNode("Path", []);
  }
  if (rangeID == "xsd:string") {
    return ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
  }
  if (rangeID == "xsd:int" || rangeID == "xsd:float") {
    return ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
  }
  if (rangeID == "xsd:boolean") {
    return ts.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
  }
  if (rangeID == "linkedql:Operator") {
    return ts.createTypeReferenceNode("Operator", []);
  }
  if (rangeID == "rdfs:Resource") {
    return ts.createTypeReferenceNode("Identifier", []);
  }
  throw Error(`Unexpected range: ${range}`);
};

function createMethodFromStep(
  step: BaseStep,
  pathClassName: ts.Identifier,
  properties: BaseProperty[]
): ts.MethodDeclaration {
  const stepTypeID = step["@id"];
  const stepTypeName = stepTypeID.replace("linkedql:", "");
  const stepName = stepTypeName[0].toLowerCase() + stepTypeName.slice(1);
  const restrictions: Restriction[] = step["rdfs:subClassOf"].filter(
    (subClass): subClass is Restriction =>
      subClass["@type"] === "owl:Restriction"
  );
  const stepProperties = properties.filter(property => {
    if (property["@id"] === "linkedql:from") {
      return false;
    }
    const domain = property["rdfs:domain"];
    if (typeof domain === "string") {
      return domain === stepTypeID;
    }
    return domain["owl:unionOf"]["@list"].some(
      step => step["@id"] === stepTypeID
    );
  });
  const parameterNames = stepProperties.map(property =>
    property["@id"].replace("linkedql:", "")
  );
  const parameters = parameterNames.map((name, i) => {
    const property = stepProperties[i];
    const propertyRestrictions = restrictions.filter(restriction => {
      return restriction["owl:onProperty"]["@id"] === property["@id"];
    });
    const cardinality =
      propertyRestrictions[0] && propertyRestrictions[0]["owl:cardinality"];
    const maxCardinality =
      propertyRestrictions[0] && propertyRestrictions[0]["owl:maxCardinality"];
    const baseType = rangeToType(property["rdfs:range"]);
    let type: ts.TypeNode = baseType;
    if (maxCardinality === 1) {
      type = ts.createUnionTypeNode([
        type,
        ts.createKeywordTypeNode(ts.SyntaxKind.NullKeyword)
      ]);
    } else if (cardinality !== 1) {
      type = ts.createArrayTypeNode(type);
    }
    return ts.createParameter(
      [],
      [],
      undefined,
      name,
      undefined,
      type,
      undefined
    );
  });
  const stepPropertyAssignments = [
    ts.createPropertyAssignment(
      ts.createStringLiteral("@type"),
      ts.createStringLiteral(stepTypeID)
    ),
    ...stepProperties.map((property, i) => {
      const propertyName = parameterNames[i];
      return ts.createPropertyAssignment(
        ts.createStringLiteral(property["@id"]),
        ts.createIdentifier(propertyName)
      );
    })
  ];
  return ts.createMethod(
    [],
    [],
    undefined,
    stepName,
    undefined,
    [],
    parameters,
    ts.createTypeReferenceNode(pathClassName, []),
    ts.createBlock([
      ts.createStatement(
        ts.createCall(
          ts.createPropertyAccess(ts.createThis(), "addStep"),
          [],
          [ts.createObjectLiteral(stepPropertyAssignments)]
        )
      ),
      ts.createReturn(ts.createThis())
    ])
  );
}

const steps = schema.filter(object => object["@type"] === "rdfs:Class");
const properties = schema.filter(object => object["@type"] !== "rdfs:Class");

const newMembers = [
  ...pathClass.members,
  ...steps.map(step => createMethodFromStep(step, pathClass.name, properties))
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
fs.writeFileSync("path.ts", prettier.format(result, { parser: "typescript" }));
