import h from './my-hyperscript';
import { diff } from './diff';
import Component from './component';

class App extends Component {
    render() {
        return h('div', { class: 'app' },
            h('h1', null, 'Simple vDOM'),
            h(
                People
            )
        );
    }
}

class People extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list: ['a1', 'b2', 'c3', 'd4', 'e5']
        };

        // 第一次改变状态
        setTimeout(() => {
            this.setState({
                list: ['a1', 'd4', 'b2', 'c3', 'e5', 'f6']
            });

            // 第二次改变状态
            setTimeout(() => {
                this.setState({
                    list: ['e5', 'd4', 'f6', 'c3', 'a1', 'b2']
                })
            }, 3000);
        }, 2000);


    }
    render(props, state) {
        return h(
            'ul', null,
            ...state.list.map(item => h('li', { key: item }, item))
        )
    };
}

const render = (vnode, parent) => {
    diff(null, vnode, parent);
}

render(h(App), document.querySelector('#root'));