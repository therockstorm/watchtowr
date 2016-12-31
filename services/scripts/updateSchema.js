import fs from 'fs';
import path from 'path';
import { printSchema } from 'graphql';
import Schema from '../src/graphql/schema';

fs.writeFileSync(
  path.join(__dirname, './schema.graphql'),
  printSchema(new Schema()),
);
