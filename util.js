/* 检查是否未定义 */
export const isDef = (o) => {
    return o !== null && o !== undefined;
}

/* 创建虚拟文本节点 */
export const VIRTUAL_TEXT_KEY = 'text';
export const createVirtualTextNode = (text) => {
    return {
        [VIRTUAL_TEXT_KEY]: text
    };
};
/* 检查是否为虚拟文本节点 */
export const isVirtualTextNode = (o) => {
    return o && o.hasOwnProperty(VIRTUAL_TEXT_KEY);
}

/* DOM相关 */
export class DOMUtil {
    static insertBefore(parent, insert, target) {
        parent.insertBefore(insert, target);
    }
    static getParentNodeBy(el) {
        return el.parentNode;
    }

    static getNextSiblingBy(el) {
        return el.nextSibling;
    }

    static removeChild(parent, target) {
        return parent.removeChild(target)
    }
    static setTextContent(el, txt) {
        el.textContent = txt
    }
    static removeChildren(el) {
        let ch = el.childNodes || [];
        while (ch[0]) {
            this.removeChild(ele, ch[0]);
        }
    }
}