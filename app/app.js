import aframe from 'aframe';
import 'aframe-text-component';
import 'aframe-look-at-component';
import 'aframe-animation-component';
import 'aframe-extras';


import axios from 'axios';

const cols = [...Array(30).keys()];
const rows = [...Array(50).keys()];
const tpl = require('./stockroom.njk');
const cartTpl = require('./cart.njk');
const checkoutTpl = require('./checkout.njk');

let products = [];
let lineItems = [];

const styles = require('./styles.css');

var client = axios.create({
  baseURL: 'http://samuji.com/api/',
  timeout: 10000
});

// const addToCart(params) {
//
//   return client.post('/products?per_page=30&q[name_cont]=Dress') {
//
//   }
// }

client.get('/products?per_page=30&q[name_cont]=Dress')
  .then(result => {
    for (const p of result.data.products) {
      let prod = {};
      for (const variant of p.variants) {
        let src = "";
        if (variant.images.length) {
          src = variant.images[0].attachment_url;
        }

        Object.assign(prod, {
          id: variant.id,
          title: variant.name,
          img: src,
          price: variant.price
        });
      }
      products.push(prod);
    }
    initScene();
  });

  // const html = tpl.render({ cols, rows, products: [{
  //           id: 12345,
  //           title: "variant.name",
  //           img: "morpheus.png",
  //           price: 500
  //         }] });
  // document.getElementById('scene').innerHTML = html;
  //
  // var scene = document.querySelector('a-scene');
  // console.log("scene");
  // scene.addEventListener('loaded', () => {
  //   const loader = document.querySelector('#loader');
  //   loader.parentNode.removeChild(loader);
  // });

function initScene() {

  const html = tpl.render({ cols, rows, products });
  document.getElementById('scene').innerHTML = html;

  var scene = document.querySelector('a-scene');
  scene.addEventListener('loaded', () => {
    setTimeout(() => {
      const loader = document.querySelector('#loader');
      loader.parentNode.removeChild(loader);
    }, 1000);
  });

  aframe.registerComponent('checkout', {
    init: function () {
      this.el.addEventListener('mouseenter', function (el) {
        this.setAttribute('scale', {x: 1.5, y: 1.5, z: 1.5});
      });
      this.el.addEventListener('mouseleave', function () {
        this.setAttribute('scale', {x: 1, y: 1, z: 1});
      });
      this.el.addEventListener('click', function () {
        var checkoutContainer = document.querySelector('#checkout-section');
        let total = 0.0;
        for(var i = 0; i < lineItems.length; i++) {
          total += parseFloat(lineItems[i].price);
        }
        checkoutContainer.innerHTML = checkoutTpl.render({ total, products: lineItems });

        const player = document.querySelector('#player');
        player.setAttribute('animation', {
          property: 'position',
          dur: 1000,
          to: { x: -2, y: 1.6, z: -55 }
        });
      });
    }
  });

  aframe.registerComponent('product', {
    schema: {
      type: 'int'
    },
    init: function () {
      this.el.addEventListener('mouseenter', function (el) {
        this.setAttribute('scale', {x: 1.2, y: 1.2, z: 1.2});
      });
      this.el.addEventListener('mouseleave', function () {
        this.setAttribute('scale', {x: 1, y: 1, z: 1});
      });
      this.el.addEventListener('click', function () {
        var cartContainer = document.querySelector('#cart-content');
        const id = this.getAttribute('product')
        // alert(this.getAttribute('product'));
        const prod = products.find((item) => {
          return item.id == id;
        });
        console.error(prod);

        lineItems.push(prod);
        cartContainer.innerHTML = cartTpl.render({ products: lineItems });
      });
    }
  });
}
