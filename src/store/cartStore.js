import { create } from 'zustand'
import { isEqualArr } from '@/utils'

const useCartStore = create((set) => ({
  products: [],
  count: 0,
  price: 0,
  isShow: false,
  shop: {},
  showCart: () => {
    set(state => {
      state.isShow = true
      return {products: state.products}
    })
  },
  hideCart: () => {
    set(state => {
      state.isShow = false
      return {products: state.products}
    })
  },
  addCommodity: commodity => {
    set(state => {
      state.count += commodity.count
      state.price += commodity.totalPrice
      if (state.products.length === 0) return {products: [...state.products, commodity]}

      let isExist = false
      const newProducts = state.products.map(item => {
        if (
          item.name === commodity.name
          && item.sugar === commodity.sugar
          && item.temperature === commodity.temperature
          && isEqualArr(item.addon, commodity.addon)
        ) {
          isExist = true
          return {...item, count: item.count + commodity.count}
        }

        return item
      })

      return isExist
      ? {products: newProducts}
      : {products: [...state.products, commodity]}
    })
  },
  checkAllCommodities: () => {
    set(state => {
      const newProducts = state.products.map(item => {
        item.checked = true
        state.count += item.count
        state.price += item.totalPrice
        return item
      })

      return {products: newProducts}
    })
  },
  unCheckAllCommodities: () => {
    set(state => {
      state.count = 0
      state.price = 0
      const newProducts = state.products.map(item => {
        item.checked = false
        return item
      })

      return {products: newProducts}
    })
  },
  clear: () => {
    set(state => {
      state.count = 0
      state.price = 0
      return {products: []}
    })
  },
  remove: commodity => {
    set(state => {
      state.count -= 1
      state.price -= commodity.totalPrice
      const newProducts = state.products.filter(item => item._id !== commodity._id)
      return {products: newProducts}
    })
  },
  reduce: commodity => {
    set(state => {
      state.count -= 1
      state.price -= (commodity.price + commodity.addonPrice)
      const newProducts = state.products.map(item => {
        if (item._id === commodity._id) {
          item.count -= 1
          item.totalPrice -= (commodity.price + commodity.addonPrice)
        }
        return item
      })

      return {products: newProducts}
    })
  },
  increase: commodity => {
    set(state => {
      state.count += 1
      state.price += (commodity.price + commodity.addonPrice)
      const newProducts = state.products.map(item => {
        if (item._id === commodity._id) {
          item.count += 1
          item.totalPrice += (commodity.price + commodity.addonPrice)
        }
        return item
      })

      return {products: newProducts}
    })
  },
  checkCommodity: commodity => {
    set(state => {
      state.count += commodity.count
      state.price += commodity.totalPrice
      const newProducts = state.products.map(item => {
        if (item._id === commodity._id) item.checked = true
        return item
      })

      return {products: newProducts}
    })
  },
  unCheckCommodity: commodity => {
    set(state => {
      state.count -= commodity.count
      state.price -= commodity.totalPrice
      const newProducts = state.products.map(item => {
        if (item._id === commodity._id) item.checked = false
        return item
      })

      return {products: newProducts}
    })
  }
}))

export default useCartStore
