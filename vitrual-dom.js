import { patch } from './diff';
import { isVirtualTextNode } from './util';

export const renderNode = (vnode) => {

    // 是虚拟文本节点的情况下直接创建文本节点
    if (isVirtualTextNode(vnode)) {
        vnode.el = document.createTextNode(vnode.text);
        return vnode.el;
    }

    const { nodeName, attributes, children } = vnode;
    let el;

    /**
     * 渲染节点，如果是字符串，则直接创建DOM
     * 如果是组件，则把props和state作为参数调用render方法创建vdom，再递归调用renderNode方法
     * 另外组件调用render方法返回的vdom可能还是组件，即如果组件内还是组件，会一直递归下去
     */
    if (typeof nodeName === 'string') {
        el = document.createElement(nodeName);
        for (let key in attributes) {
            el.setAttribute(key, attributes[key]);
        }
    } else if (typeof nodeName === 'function') {
        const component = new nodeName(attributes);
        const vdom = component.render(component.props, component.state);
        el = renderNode(vdom);
        vdom.key = attributes ? attributes.key : undefined;
        vdom.el = el;
        component.el = el;
        component.vdom = vdom;
    }
    (children || []).forEach(child => {
        el.appendChild(renderNode(child));
    });
    return el;
}


export const renderComponent = (component, parent) => {
    let rendered = component.render(component.props, component.state); //产生虚拟DOM节点
    patch(component.vdom, rendered);
}