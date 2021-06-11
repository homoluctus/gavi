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

function calcColumnLength(str: string): number {
  return str.length + tableFormat.padding * 2;
}

class Meta {
  static readonly maxWidth: number = process.stdout.columns;
  static maxColumnWidth: number[] = [];
  static needsAjustment: boolean = false;
  private static updated: boolean = false;

  static updateWidth(): void {
    if (this.updated) {
      return;
    }

    const sum = this.maxColumnWidth.reduce((sum, ele) => sum + ele);
    const diff = sum - this.maxWidth;
    if (diff > 0) {
      const shrink = Math.ceil(diff / this.maxColumnWidth.length) + 1;
      this.maxColumnWidth = this.maxColumnWidth.map((w) => w - shrink);
      this.needsAjustment = true;
    }
    this.updated = true;
  }
}

class Node {
  data: string[];
  isChunk: boolean = false;
  next: Node | undefined = undefined;

  constructor(data: string[], isChunk: boolean = false) {
    this.data = data;
    this.isChunk = isChunk;
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
    if (!Meta.maxColumnWidth.length) {
      data.forEach((v, i) => {
        Meta.maxColumnWidth[i] = calcColumnLength(v);
      });
    } else {
      data.forEach((v, i) => {
        const strlen = calcColumnLength(v);
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
    const head = tableLinkedList.head;
    if (head === undefined) {
      throw new Error('Data of table headers does not exist');
    }

    const { headers, nextNode } = this.renderHeaders(head);
    if (nextNode === undefined) {
      throw new Error('Data of table body does not exist');
    }

    let result = `${this.line}${headers}`;
    result += this.betweenHeaderRows;
    result += this.renderRows(nextNode);
    return result;
  }

  renderLine(chars: Line): string {
    const middle = Meta.maxColumnWidth
      .map((w) => chars.middle.repeat(w))
      .join(tableFormat.chars.line.sep);
    return `${chars.begin}${middle}${chars.end}${tableFormat.newline}`;
  }

  renderHeaders(node: Node): { headers: string; nextNode: Node | undefined } {
    let result = '';
    result += this.renderRow(node);
    while (node.next && node.next.isChunk) {
      node = node.next;
      result += this.renderRow(node);
    }
    return { headers: result, nextNode: node.next };
  }

  renderRows(node: Node): string {
    let result = '';
    let currentNode: Node | undefined = node;
    while (currentNode) {
      result += `${this.renderRow(currentNode)}`;

      currentNode = currentNode.next;
      if (!currentNode || !currentNode.isChunk) {
        result += this.line;
      }
    }
    return result;
  }

  renderRow(node: Node): string {
    this.adjust(node);
    const chars = tableFormat.chars.row;
    const row = node.data
      .map((v, i) => this.pad(v, Meta.maxColumnWidth[i]))
      .join(chars.sep);
    return `${chars.begin}${row}${chars.end}${tableFormat.newline}`;
  }

  adjust(node: Node): void {
    if (!Meta.needsAjustment) {
      return;
    }

    node.data.forEach((v, i) => {
      const strlen = v.length;
      const maxColumnWidthWithoutPadding =
        Meta.maxColumnWidth[i] - tableFormat.padding * 2;
      if (strlen <= maxColumnWidthWithoutPadding) {
        return;
      }

      let currentNode = node;
      const cnt = Math.ceil(strlen / maxColumnWidthWithoutPadding);
      for (let j = 0; j < cnt; j++) {
        const partOfStr = v.substring(
          j * maxColumnWidthWithoutPadding,
          (j + 1) * maxColumnWidthWithoutPadding
        );

        if (j === 0) {
          currentNode.data[i] = partOfStr;
        } else if (currentNode.next) {
          if (currentNode.next.isChunk) {
            currentNode.next.data[i] = partOfStr;
          } else {
            const chunk = this.creatChunk(node.data.length, i, partOfStr);
            const oldNextNode = currentNode.next;
            currentNode.next = new Node(chunk, true);
            currentNode.next.next = oldNextNode;
          }
          currentNode = currentNode.next;
        } else {
          const chunk = this.creatChunk(node.data.length, i, partOfStr);
          currentNode.next = new Node(chunk, true);
          currentNode = currentNode.next;
        }
      }
    });
  }

  creatChunk(len: number, index: number, str: string): string[] {
    const chunk = Array(len).fill('');
    chunk[index] = str;
    return chunk;
  }

  pad(str: string, maxColWidth: number): string {
    str = str.trim();
    const leftPadding = tableFormat.paddingStr.repeat(tableFormat.padding);
    const cnt = maxColWidth - (tableFormat.padding + str.length);
    const rightPadding = tableFormat.paddingStr.repeat(cnt);
    return `${leftPadding}${str}${rightPadding}`;
  }
}
