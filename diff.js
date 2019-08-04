import { renderNode } from './vitrual-dom';
import { DOMUtil, isVirtualTextNode, VIRTUAL_TEXT_KEY } from './util';

/**
 * 如果旧节点oldVnode为空，那么渲染新节点newVnode后添加为parent
 * 否则进行diff算法比较
 * 其实这个函数只在app.js里用了一次
 * @param {Vnode} oldVnode 
 * @param {Vnode} newVnode 
 * @param {ElementHTML} parent 
 */
export const diff = (oldVnode, newVnode, parent) => {
    if (oldVnode) {
        patch(oldVnode, newVnode);
    } else {
        const newDom = renderNode(newVnode);
        parent.appendChild(newDom);
        return newDom;
    }
}

/**
 * 如果两个节点是相同的，那么进行patchVnode
 * 否则不用比较了，直接将旧节点替换
 * @param {Vnode} oldVnode 
 * @param {Vnode} newVnode 
 */
export function patch(oldVnode, newVnode) {
    if (sameVnode(oldVnode, newVnode)) {
        patchVnode(oldVnode, newVnode);
    } else {
        const oEl = oldVnode.el;
        let parentEle = DOMUtil.getParentNodeBy(oEl);
        renderNode(newVnode);
        if (parentEle !== null) {
            DOMUtil.insertBefore(parentEle, newVnode.el, DOMUtil.getNextSiblingBy(oEl));
            DOMUtil.removeChild(parentEle, oldVnode.el);
            oldVnode = null;
        }
    }
    return newVnode;
}

/**
 * 节点的比较有5种情况
 * if (oldVnode === newVnode)，他们的引用一致，可以认为没有变化。
 * isVirtualTextNode(oldVnode) && isVirtualTextNode(newVnode) && oldVnode[VIRTUAL_TEXT_KEY] !== newVnode[VIRTUAL_TEXT_KEY]，文本节点的比较，需要修改，则会调用Node.textContent = vnode.text。
 * if( oldChildren && newChildren && oldChildren !== newChildren ), 两个节点都有子节点，而且它们不一样，这样我们会调用updateChildren函数比较子节点，这是diff的核心，后边会讲到。
 * else if (newChildren)，只有新的节点有子节点，调用renderNode(vnode)，vnode.el已经引用了老的dom节点，renderNode函数会在老dom节点上添加子节点。
 * else if (oldChildren)，新节点没有子节点，老节点有子节点，直接删除老节点。
 * @param {Vnode} oldVnode 
 * @param {Vnode} newVnode 
 */
function patchVnode(oldVnode, newVnode) {
    if (oldVnode === newVnode) return; // 引用一致则是没有变化

    // 这是很重要的一步，让newVnode.el引用到现在的真实dom，当el修改时，newVnode.el会同步变化。
    const el = newVnode.el = oldVnode.el;
    let oldChildren = oldVnode.children;
    let newChildren = newVnode.children;

    // 判断是否为文本节点，如果是文本节点那么直接修改文本值
    if (isVirtualTextNode(oldVnode) && isVirtualTextNode(newVnode) &&
        oldVnode[VIRTUAL_TEXT_KEY] !== newVnode[VIRTUAL_TEXT_KEY]) {
        DOMUtil.setTextContent(el, newVnode[VIRTUAL_TEXT_KEY]);
    } else {
        // 这一步是在新节点修改了原有节点的原生属性的情况下，更新虚拟DOM（例如修改了class或者id）
        // 但是目前不处理
        // updateEle(el, newVnode, oldVnode); 

        // 两个节点都有子节点，并且引用不一致，那么更新所有子节点
        if (oldChildren && newChildren &&
            oldChildren !== newChildren) {
            updateChildren(el, oldChildren, newChildren);
        } else if (newChildren) {
            //旧节点没有子节点， 新节点有子节点，那么调用renderNode给newVnode的el挂载真实DOM
            renderNode(newVnode);
        } else if (oldChildren) {
            DOMUtil.removeChildren(el);
        }
    }
}



function updateChildren(parentElm, oldChildren, newChildren) {
    let oldStartIdx = 0;
    let oldEndIdx = oldChildren.length - 1;
    let newStartIdx = 0;
    let newEndIdx = newChildren.length - 1;

    let oldStartVnode = oldChildren[0];
    let oldEndVnode = oldChildren[oldEndIdx];
    let newStartVnode = newChildren[0];
    let newEndVnode = newChildren[newEndIdx];

    let oldKeyToIdx;
    let idxInOld;
    let elmToMove;
    let before;
    /**
     * oldCh和newCh各有两个头尾的变量StartIdx和EndIdx，它们的2个变量相互比较，
     * 一共有4种比较方式。如果4种比较都没匹配，
     * 如果设置了key，就会用key进行比较，在比较的过程中，变量会往中间靠，
     * 一旦StartIdx>EndIdx表明oldCh和newCh至少有一个已经遍历完了，就会结束比较。
     */
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (oldStartVnode == null) {
            oldStartVnode = oldChildren[++oldStartIdx]
        } else if (oldEndVnode == null) {
            oldEndVnode = oldChildren[--oldEndIdx]
        } else if (newStartVnode == null) {
            newStartVnode = newChildren[++newStartIdx]
        } else if (newEndVnode == null) {
            newEndVnode = newChildren[--newEndIdx]
        } else if (sameVnode(oldStartVnode, newStartVnode)) {
            patchVnode(oldStartVnode, newStartVnode)
            oldStartVnode = oldChildren[++oldStartIdx]
            newStartVnode = newChildren[++newStartIdx]
        } else if (sameVnode(oldEndVnode, newEndVnode)) {
            patchVnode(oldEndVnode, newEndVnode)
            oldEndVnode = oldChildren[--oldEndIdx]
            newEndVnode = newChildren[--newEndIdx]
        } else if (sameVnode(oldStartVnode, newEndVnode)) {
            patchVnode(oldStartVnode, newEndVnode)
                // 如果insertBefore的第三个参数为空，将会插入到节点末尾
            DOMUtil.insertBefore(parentElm, oldStartVnode.el, DOMUtil.nextSibling(oldEndVnode.el))
            oldStartVnode = oldChildren[++oldStartIdx]
            newEndVnode = newChildren[--newEndIdx]
        } else if (sameVnode(oldEndVnode, newStartVnode)) {
            patchVnode(oldEndVnode, newStartVnode)
            DOMUtil.insertBefore(parentElm, oldEndVnode.el, oldStartVnode.el)
            oldEndVnode = oldChildren[--oldEndIdx]
            newStartVnode = newChildren[++newStartIdx]
        } else {
            // 使用key时的比较
            if (oldKeyToIdx === undefined) {
                // 生成key的索引表
                oldKeyToIdx = createKeyToOldIdx(oldChildren, oldStartIdx, oldEndIdx);
            }
            idxInOld = oldKeyToIdx[newStartVnode.key];
            if (!idxInOld) {
                // vue中会遍历查找是否有可复用节点，此处是直接创建新的DOM节点
                DOMUtil.insertBefore(parentElm, renderNode(newStartVnode), oldStartVnode.el);
                newStartVnode = newChildren[++newStartIdx];
            } else {
                elmToMove = oldChildren[idxInOld];
                // if (elmToMove.sel !== newStartVnode.sel) {
                if (!sameVnode(elmToMove, newStartVnode)) {
                    DOMUtil.insertBefore(parentElm, renderNode(newStartVnode), oldStartVnode.el);
                } else {
                    patchVnode(elmToMove, newStartVnode);
                    oldChildren[idxInOld] = null;
                    DOMUtil.insertBefore(parentElm, elmToMove.el, oldStartVnode.el);
                }

                newStartVnode = newChildren[++newStartIdx];
            }
        }
    }
    if (oldStartIdx > oldEndIdx) {
        before = newChildren[newEndIdx + 1] == null ? null : newChildren[newEndIdx + 1].el
        addVnodes(parentElm, before, newChildren, newStartIdx, newEndIdx)
    } else if (newStartIdx > newEndIdx) {
        removeVnodes(parentElm, oldChildren, oldStartIdx, oldEndIdx)
    }
}

function sameVnode(a, b) {
    return (
        a.key === b.key && a.nodeName === b.nodeName
    )
}

function createKeyToOldIdx(children, beginIdx, endIdx) {
    let map = {};
    let key, childVnode;
    for (let i = beginIdx; i <= endIdx; ++i) {
        childVnode = children[i];
        if (childVnode != null) {
            key = childVnode.key;
            if (key !== null) {
                map[key] = `${i}`;
            }
        }
    }
    return map;
}

function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
    let childVnode = null;
    for (; startIdx <= endIdx; ++startIdx) {
        childVnode = vnodes[startIdx]
        if (childVnode != null) {
            DOMUtil.removeChild(parentElm, childVnode.el)
        }
    }
}

function addVnodes(parentElm, before, vnodes, startIdx, endIdx) {
    let childVnode = null;
    for (; startIdx <= endIdx; ++startIdx) {
        childVnode = vnodes[startIdx];
        if (childVnode != null) {
            DOMUtil.insertBefore(parentElm, renderNode(childVnode), before);
        }
    }
}