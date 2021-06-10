import yaml from 'js-yaml';
import { Line, ReportObject, TableFormat } from '../interfaces';

export function table(data: ReportObject[]): string {
  const headers = Object.keys(data[0]);
  const tableLinkedList = new LinkedList();
  tableLinkedList.add(headers);

  data.forEach((d) => {
    const row = Object.values(d).map((cell) =>
      typeof cell === 'object'
        ? yaml.dump(cell, { skipInvalid: true, lineWidth: 50 })
        : cell
    ) as string[];
    tableLinkedList.add(row);
  });

  const renderer = new Renderer();
  return renderer.render(tableLinkedList);
}

const tableFormat: TableFormat = {
  newline: '\n',
  padding: 1,
  paddingStr: ' ',
  chars: {
    betweenHeaderRows: { begin: '+', middle: '=', sep: '+', end: '+' },
    line: { begin: '+', middle: '-', sep: '+', end: '+' },
    row: { begin: '|', sep: '|', end: '|' }
  }
};

class Meta {
  static readonly maxWidth: number = process.stdout.columns;
  static maxColumnWidth: number[] = [];
  private static updated: boolean = false;

  static updateWidth(): void {
    if (this.updated) {
      return;
    }

    const sum = this.maxColumnWidth.reduce((sum, ele) => sum + ele);
    const diff = sum - this.maxWidth;
    if (diff > 0) {
      const shrink = Math.ceil(diff / this.maxColumnWidth.length);
      this.maxColumnWidth = this.maxColumnWidth.map((w) => w - shrink);
    }
    this.updated = true;
  }
}

class Node {
  data: string[];
  isChunk: boolean = false;
  next: Node | undefined = undefined;

  constructor(data: string[]) {
    this.data = data;
  }
}

class LinkedList {
  head: Node | undefined = undefined;

  add(data: string[]): void {
    this.insertMeta(data);

    if (this.head === undefined) {
      this.head = new Node(data);
    } else {
      this.add_node(this.head, data);
    }
  }

  private add_node(node: Node, data: string[]): void {
    if (node.next === undefined) {
      node.next = new Node(data);
    } else {
      this.add_node(node.next, data);
    }
  }

  private insertMeta(data: string[]): void {
    const paddingCnt = tableFormat.padding * 2;
    if (!Meta.maxColumnWidth.length) {
      data.forEach((v, i) => {
        Meta.maxColumnWidth[i] = v.length + paddingCnt;
      });
    } else {
      data.forEach((v, i) => {
        const strlen = v.length + paddingCnt;
        if (Meta.maxColumnWidth[i] < strlen) {
          Meta.maxColumnWidth[i] = strlen;
        }
      });
    }
  }
}

class Renderer {
  betweenHeaderRows: string;
  line: string;

  constructor() {
    Meta.updateWidth();
    this.betweenHeaderRows = this.renderLine(
      tableFormat.chars.betweenHeaderRows
    );
    this.line = this.renderLine(tableFormat.chars.line);
  }

  render(tableLinkedList: LinkedList): string {
    const headers = tableLinkedList.head;
    if (headers === undefined) {
      throw new Error('Data of table headers does not exist');
    }

    let result: string = this.line;
    result += this.renderHeaders(headers);
    result += this.betweenHeaderRows;

    if (headers.next === undefined) {
      throw new Error('Data of table body does not exist');
    }
    result += this.renderRows(headers.next);
    return result;
  }

  renderLine(chars: Line): string {
    const middle = Meta.maxColumnWidth
      .map((w) => chars.middle.repeat(w))
      .join(tableFormat.chars.line.sep);
    return `${chars.begin}${middle}${chars.end}${tableFormat.newline}`;
  }

  renderHeaders(node: Node): string {
    let result = '';
    result += this.renderRow(node);
    while (node.next && node.next.isChunk) {
      node = node.next;
      result += this.renderRow(node);
    }
    return result;
  }

  renderRows(node: Node): string {
    let result = '';
    let currentNode: Node | undefined = node;
    while (currentNode) {
      result += `${this.renderRow(currentNode)}${this.line}`;
      currentNode = currentNode.next;
    }
    return result;
  }

  renderRow(node: Node): string {
    const chars = tableFormat.chars.row;
    const row = node.data
      .map((v, i) => this.pad(v, Meta.maxColumnWidth[i]))
      .join(chars.sep);
    return `${chars.begin}${row}${chars.end}${tableFormat.newline}`;
  }

  // TODO
  adjust(node: Node): void {}

  pad(str: string, maxColWidth: number): string {
    str = str.trim();
    const leftPadding = tableFormat.paddingStr.repeat(tableFormat.padding);
    const cnt = maxColWidth - (tableFormat.padding + str.length);
    const rightPadding = tableFormat.paddingStr.repeat(cnt);
    return `${leftPadding}${str}${rightPadding}`;
  }
}
