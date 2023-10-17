import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { View, Text, Image, Checkbox, ScrollView } from '@tarojs/components'
import { drinksTemperature, drinksSugar, drinksAddon } from '@/constants'
import { showModal } from '@/utils'
import useCartStore from '@/store/cartStore'
import {
  fetchAllCategories,
  fetchAllCommodities,
  fetchDefaultAddress,
  fetchNearestShop
} from '@/api/v1'
import './index.css'

// 自取/外送 切换组件
const SwitchButton = ({orderType, handleClickOrderType}) => (
  <View className='flex justify-between text-[28rpx] bg-background rounded-[32rpx]'>
    <Text
      className={`px-[24rpx] py-[12rpx] ${orderType === '自取' ? 'bg-primary-700 text-primary-100 rounded-[32rpx]' : ''}`}
      onClick={() => handleClickOrderType('自取')}
    >
      自取
    </Text>

    <Text
      className={`px-[24rpx] py-[12rpx] ${orderType === '外送' ? 'bg-primary-700 text-primary-100 rounded-[32rpx]' : ''}`}
      onClick={() => handleClickOrderType('外送')}
    >
      外送
    </Text>
  </View>
)

// 右侧商品种类模块组件
const CommoditySection = ({index, category, commodities, setCurrentCommodity, setShowParams, addCommodity, showCart}) => (
  <View id={`category${ index }`} className='pt-[16rpx] commodity-section'>
    <Text className='mx-[16rpx] text-primary-400'>{category.name}</Text>

    <View>
      {commodities.map((commodity, idx) => (
        <CommodityCard
          key={commodity.name}
          index={idx}
          categoryType={category.type}
          setCurrentCommodity={setCurrentCommodity}
          setShowParams={setShowParams}
          addCommodity={addCommodity}
          showCart={showCart}
          {...commodity}
        />
      ))}
    </View>
  </View>
)

// 右侧商品卡片组件
const CommodityCard = ({index, _id, name, sales, image, price, categoryType, setCurrentCommodity, setShowParams, addCommodity, showCart}) => {
  // 选规格
  const handleSelectParams = () => {
    setCurrentCommodity({_id, name, image, price})
    setShowParams(true)
  }

  // 直接加购
  const handleAddToCart = () => {
    const commodity = {
      _id,
      name,
      image,
      price,
      temperature: '',
      sugar: '',
      addon: [],
      addonPrice: '',
      totalPrice: price,
      count: 1,
      checked: true
    }

    addCommodity(commodity)
    showCart()
  }

  return (
    <View className={`${ index === 0 ? '' : 'mt-[32rpx]' } relative flex items-center px-[48rpx] py-[24rpx] rounded-[32rpx]`}>
      <Image
        src={image}
        alt={name}
        className='w-[120rpx] h-[120rpx] rounded-[32rpx]'
      />

      <View className='flex flex-col ml-[32rpx] py-[8rpx] text-[28rpx]'>
        <View className='flex flex-col'>
          <Text>{name}</Text>
          <Text className='mt-[4rpx] text-primary-400 text-[24rpx]'>销量 {sales}</Text>
        </View>

        <View className='flex items-end gap-[8rpx] mt-[12rpx]'>
          <Text>￥{price}</Text>
        </View>
      </View>

      <View
        className={`absolute right-[48rpx] bottom-[32rpx] px-[16rpx] h-[48rpx] text-center leading-[48rpx] text-[24rpx] text-primary-100 bg-primary-700 rounded-[32rpx] ${categoryType == '饮品' ? '' : 'hidden'}`}
        onClick={handleSelectParams}
      >
        选规格
      </View>

      <Text
        className={`absolute right-[48rpx] bottom-[32rpx] iconfont icon-tianjia3 px-[16rpx] h-[48rpx] text-center leading-[48rpx] text-[36rpx] text-primary-400 ${categoryType == '饮品' ? 'hidden' : ''}`}
        onClick={handleAddToCart}
      />
    </View>
  )
}

// 购物车详情中商品卡片组件
const CartCommodityCard = ({index, name, image, temperature, sugar, count, addon, totalPrice, checked, handleCartReduce, handleCartAdd, handleCheckCommodity}) => {
  return (
    <View className='relative flex justify-between items-center px-[48rpx] py-[24rpx] rounded-[32rpx]'>
      <View className='flex items-center gap-[24rpx]'>
        <Checkbox color='#d29f7e' checked={checked} onClick={() => handleCheckCommodity(index)} />

        <Image
          src={image}
          alt={name}
          className='w-[120rpx] h-[120rpx] ml-[16rpx] rounded-[32rpx]'
        />

        <View className='flex flex-col ml-[32rpx] py-[8rpx] text-[28rpx]'>
          <View className='flex flex-col'>
            <Text>{name}</Text>
            {temperature !== '' && (
              <Text className='mt-[4rpx] text-primary-400 text-[24rpx]'>
                { temperature }/{ sugar }{addon.length === 0 ? '' : `/${ addon.join( ',' ) }`}
              </Text>
            )}
            
          </View>

          <View className='flex items-center mt-[12rpx]'>
            <Text>￥{ totalPrice }</Text>
          </View>
        </View>
      </View>
      
      <View className='flex justify-around items-center'>
        <Text
          className='iconfont icon-jianshao1 text-primary-400 text-[48rpx]'
          onClick={() => handleCartReduce(index)}
        />
        <Text className='mx-[24rpx]'>{ count }</Text>
        <Text
          className='iconfont icon-tianjia3 text-primary-700 text-[48rpx]'
          onClick={() => handleCartAdd(index)}
        />
      </View>
    </View>
  )
}

const Menu = () => {
  const {
    products,
    count: cartCount,
    price: cartPrice,
    isShow,
    showCart,
    hideCart,
    addCommodity,
    checkAllCommodities,
    unCheckAllCommodities,
    clear,
    reduce,
    remove,
    increase,
    checkCommodity,
    unCheckCommodity
  } = useCartStore()

  const [orderType, setOrderType] = useState('自取')  // 订单类型
  const [orderAddress, setOrderAddress] = useState({})  // 订单地址
  const [orderShop, setOrderShop] = useState({})  // 订单门店
  const [categories, setCategories] = useState([])  // 商品分类列表
  const [categoryIndex, setCategoryIndex] = useState(0) // 当前展示的分类
  const [selectedCategory, setSelectedCategory] = useState('') // 当前选中分类的id
  const [categoryHeight, setCategoryHeight] = useState([])  // 右侧各个分类模块距离其父级容器顶部的距离
  const [scrollTopDistance, setScrollTopDistance] = useState(0) // 右侧商品列表当前距离顶部的距离
  const [scrollDistance, setScrollDistance] = useState(0) // 记录右侧商品列表本地滚动的距离
  const [commodities, setCommodities] = useState([])  // 商品列表
  const [currentCommodity, setCurrentCommodity] = useState({})  // 当前选中的商品
  const [showParams, setShowParams] = useState(false) // 是否显示选规格窗口
  const [temperature, setTemperature] = useState('正常冰') // 饮品温度
  const [sugar, setSugar] = useState('不另外加糖')  // 饮品糖度
  const [addon, setAddon] = useState([])  // 饮品小料
  const [addonPrice, setAddonPrice] = useState(0) // 选择的小料的价格
  const [totalPrice, setTotalPrice] = useState(0) // 饮品总价
  useEffect(() => setTotalPrice(currentCommodity.price), [currentCommodity])
  const [count, setCount] = useState(1) // 饮品数量
  // const [showCart, setShowCart] = useState(false) // 是否显示购物车窗口
  const [showCartDetails, setShowCartDetails] = useState(false) // 是否显示购物车详情窗口
  const [checkAll, setCheckAll] = useState(true)  // 购物车详情窗口中是否选中所有商品

  // 获取路由参数
  useDidShow(() => {
    const data = Taro.getCurrentInstance().preloadData
    if (!data) return

    const {routeType} = data
    switch (routeType) {
      case 'index':
        const {type} = data
        setOrderType(type)
        if (type === '外送') {
          fetchDefaultAddress().then(res => setOrderAddress(res.data))
        }
        break
      case 'drinkBoard':
        const {drink} = data
        setOrderType('外送')
        fetchDefaultAddress().then(res => setOrderAddress(res.data))
        setCurrentCommodity(drink)
        setShowParams(true)
        break
      case 'reselectAddress':
        const {address} = data
        setOrderAddress(address)
        break
      case 'reselectShop':
        const {shop} = data
        setOrderShop(shop)
        break
      case 'oneMoreOrder':
        const {type: orderType2, address: orderAddress2, commodities: items} = data
        console.log('commodities', items)
        items.forEach(item => {
          item.checked = true
          addCommodity(item)
        })
        setShowCartDetails(true)
        setOrderType(orderType2)
        setOrderAddress(orderAddress2)
        break
      default:
        return
    }
    Taro.preload(null)
  })

  // 获取门店信息
  useDidShow(() => {
    fetchNearestShop().then(res => setOrderShop(res.data))
  })

  // 切换订单类型
  const handleClickOrderType = type => {
    setOrderType(type)
    if (type === '自取') {
      setOrderAddress({})
    } else {
      fetchDefaultAddress().then(res => setOrderAddress(res.data))
    }
    fetchNearestShop().then(res => setOrderShop(res.data))
  }

  // 获取商品分类列表
  useEffect(() => {
    fetchAllCategories().then(res => setCategories(res.data.reverse()))
  }, [])

  // 选中某个分类
  const handleClickCategory = index => {
    setCategoryIndex(index)
    setSelectedCategory('catagory' + index)
  }

  // 获取商品列表
  useEffect(() => {
    fetchAllCommodities().then(res => setCommodities(res.data))
  }, [])

  // 获取右侧商品列表每个种类模块距离顶部的距离
  useEffect(() => {
    let heights = [], initialHeight = 0
    const query = Taro.createSelectorQuery()
    query.selectAll('.commodity-section').boundingClientRect()
    query.exec(res => {
      if (res[0].length === 0) return

      res[0].forEach(section => {
        initialHeight += section.height
        heights.push( initialHeight )
      })

      setCategoryHeight(heights)
      setScrollTopDistance(heights[categoryIndex - 1])
    })
  }, [categoryIndex])

  // 处理右侧商品列表滚动
  const handleScroll = e => {
    if (categoryHeight.length === 0) return
    let {scrollTop} = e.detail

    // 到达底部
    if (scrollTop >= categoryHeight[categoryIndex - 1]) {
      // 到达底部要把锚点id清除
      // 否则锚点id选中不到第一项category1
      // 因为category1此时已经变成了默认值，无法通过锚点进行跳转
      setSelectedCategory('')
    }

    // 根据滚动方向和滚动距离切换左侧正在展示的分类
    if (scrollTop >= scrollDistance) {
      // 向下滚动
      if (categoryIndex + 1 < categoryHeight.length && scrollTop >= categoryHeight[categoryIndex]) {
        setCategoryIndex(categoryIndex + 1)
      }
    } else {
      // 向上滚动
      if (categoryIndex - 1 >= 0 && scrollTop < categoryHeight[categoryIndex - 1]) {
        setCategoryIndex(categoryIndex - 1)
      }
    }

    // 存储本次滚动的距离,用于下次滚动时进行滚动方向判断
    setScrollDistance(scrollTop)
  }

  // 添加/取消添加小料
  const handleAddon = obj => {
    const {name, price} = obj

    if (addon.includes(name)) {
      // 取消添加
      setAddon(addon.filter(item => item !== name))
      setAddonPrice(addonPrice - price)
      setTotalPrice(totalPrice - price * count)
    } else {
      // 添加
      setAddon([...addon, name])
      setAddonPrice(addonPrice + price)
      setTotalPrice(totalPrice + price * count)
    }
  }

  // 增加饮品数量
  const handleAdd = () => {
    setCount(count + 1)
    setTotalPrice(totalPrice + currentCommodity.price + addonPrice)
  }

  // 减少饮品数量
  const handleReduce = () => {
    if (count === 1) return false
    setCount(count - 1)
    setTotalPrice(totalPrice - currentCommodity.price - addonPrice)
  }

  // 重置饮品参数
  const resetCommodityParams = () => {
    setTemperature('正常冰')
    setSugar('不另外加糖')
    setAddon([])
    setAddonPrice(0)
    setCount(1)
  }

  // 加入购物车
  const addToCart = () => {
    const commodity = {
      _id: currentCommodity._id,
      name: currentCommodity.name,
      image: currentCommodity.image,
      price: currentCommodity.price,
      temperature,
      sugar,
      addon,
      addonPrice,
      totalPrice,
      count,
      checked: true
    }

    addCommodity(commodity)
    setShowParams(false)
    // setShowCart(true)
    showCart()
    resetCommodityParams()
  }

  // 显示购物车详情
  const handleCartDetails = () => {
    // setShowCart(false)
    hideCart()
    setShowCartDetails(true)
  }

  // 跳转至订单结算页面
  const goToPayment = e => {
    e.stopPropagation()
    Taro.preload({routeType: 'menu', type: orderType, address: orderAddress, shop: orderShop})
    Taro.navigateTo({url: '/packageA/pages/payment/index'})
  }

  // 隐藏购物车详情窗口
  const hideCartDetailMask = () => {
    setShowCartDetails(false)
    // setShowCart(true)
    showCart()
  }

  // 勾选/取消勾选所有商品（购物车详情窗口）
  const checkAllCommodity = () => {
    if (checkAll) {
      setCheckAll(false)
      unCheckAllCommodities()
    } else {
      setCheckAll(true)
      checkAllCommodities()
    }
  }

  // 重置购物车相关参数
  const resetCartParams = () => {
    clear()
    setShowCartDetails(false)
  }

  // 清空购物车
  const clearCart = () => showModal('确认清空购物车吗？', resetCartParams)

  // 处理购物车详情中的数量加减
  const handleCartReduce = index => {
    const commodity = products[index]
    console.log('commodity', commodity)
    if (!commodity.checked) return

    if (cartCount === 1) {
      const isConfirm = showModal('确定不要了吗？', resetCartParams)
      if (!isConfirm) return
    }

    commodity.count === 1 ? remove(commodity) : reduce(commodity)
  }

  const handleCartIncrease = index => {
    const commodity = products[index]
    console.log('commodity', commodity)
    if (!commodity.checked) return
    increase(commodity)
  }

  // 购物车详情，判断是否勾选了所有商品
  const checkCommoditiesStatus = () => {
    if (products.every(item => item.checked === true)) {
      setCheckAll(true)
    }
  }

  // 购物车详情，勾选/取消勾选商品
  const handleCheckCommodity = index => {
    const commodity = products[index]

    if (commodity.checked) {
      // 取消勾选
      setCheckAll(false)
      unCheckCommodity(commodity)
    } else {
      // 进行勾选
      checkCommodity(commodity)
      checkCommoditiesStatus()
    }
  }

  return (
    <View className='flex flex-col h-screen bg-white'>
      {/* 头部 */}
      <View className='flex justify-between items-center w-full h-[120rpx] px-[32rpx] py-[16rpx] border-b border-background z-99'>
        {/* 自取 */}
        <View
          className={`flex flex-col justify-around items-start ${orderType === '自取' ? '' : 'hidden' }`}
          onClick={() => Taro.navigateTo({url: '/packageA/pages/shop/index'})}
        >
          <View>
            <Text>{orderShop.name}</Text>
            <Text className='ml-[8rpx] iconfont icon-xiangyou1 text-[32rpx]' />
          </View>

          <Text className='mt-[8rpx] text-primary-400 text-[24rpx]'>{orderShop.location}</Text>
        </View>

        {/* 外送 */}
        <View
          className={`flex flex-col justify-around items-start ${ orderType === '外送' ? '' : 'hidden' }`}
          onClick={() => {
            Taro.preload({from: 'menu'})
            Taro.navigateTo({ url: '/packageA/pages/address/show/index'})
          }}
        >
          <View>
            <Text>{ orderAddress.location + orderAddress.door }</Text>
            <Text className='ml-[8rpx] iconfont icon-xiangyou1 text-[32rpx]' />
          </View>

          <View className='flex items-center gap-[24rpx] mt-[8rpx] text-primary-400 text-[24rpx]'>
            <Text>{ orderAddress.tel }</Text>
            <Text>{ orderAddress.name }</Text>
          </View>
        </View>

        {/* 切换订单类型 */}
        <SwitchButton
          orderType={orderType}
          setOrderType={setOrderType}
          handleClickOrderType={handleClickOrderType}
        />
      </View>

      {/* 内容区域 */}
      <View className='flex flex-1 justify-between'>
        {/* 左侧目录 */}
        <ScrollView scrollY className='w-[200rpx] h-[calc(100vh-120rpx)] bg-background'>
          { categories.map( ( item, index ) => (
            <View
              key={item.name}
              className={`flex justify-center items-center w-[200rpx] h-[120rpx] text-primary-400 bg-white ${ index === categoryIndex ? 'border-l-[8rpx] border-primary-700' : '' }`}
              onClick={() => handleClickCategory(index)}
            >
              <Text className={`flex justify-center items-center w-full h-full ${ index === categoryIndex ? 'text-primary-700 bg-white' : 'bg-background' } ${ index === ( categoryIndex - 1 ) ? 'rounded-br-[32rpx]' : '' } ${ index === ( categoryIndex + 1 ) ? 'rounded-tr-[32rpx]' : '' }`}>
                { item.name }
              </Text>
            </View>
          ) ) }
        </ScrollView>

        {/* 右侧商品列表 */}
        <ScrollView
          scrollY
          scrollWithAnimation
          scrollIntoView={selectedCategory}
          enhanced
          bounces={false}
          onScroll={handleScroll}
          scrollTop={scrollTopDistance}
          className='flex-1 h-[calc(100vh-120rpx)]'
        >
          { commodities.map( ( item, index ) => (
            <CommoditySection
              key={item._id}
              index={index}
              setCurrentCommodity={setCurrentCommodity}
              setShowParams={setShowParams}
              addCommodity={addCommodity}
              showCart={showCart}
              {...item}
            />
          ) ) }

          {commodities.length > 0 && <View className='flex justify-center items-center w-full h-[60rpx] mt-[20rpx] text-[24rpx] text-dimWhite'>已经到底啦~~~</View>}
        </ScrollView>
      </View>

      {/* 选规格 */}
      <View
        className={`mask flex items-end ${ showParams ? '' : 'hidden' }`}
        onClick={() => setShowParams(false)}
      >
        <View
          className='flex flex-col w-full px-[32rpx] bg-white rounded-t-[32rpx]'
          onClick={e => e.stopPropagation()}
        >
          {/* 顶部 */}
          <View className='flex'>
            <Image
              src={currentCommodity.image}
              className='relative top-[-40rpx] w-[144rpx] h-[144rpx] rounded-[32rpx] box-shadow'
            />
            <Text className='ml-[32rpx] mt-[32rpx]'>{currentCommodity.name}</Text>
          </View>

          {/* 温度 */}
          <View>
            <Text>温度</Text>

            <View className='flex gap-[24rpx] mt-[16rpx] text-primary-400'>
              { drinksTemperature.map( item => (
                <View
                  key={item.name}
                  className={`px-[24rpx] py-[12rpx] border border-primary-400 rounded-[16rpx] ${ item.name === temperature ? 'text-primary-100 bg-primary-700' : 'border border-primary-400' }`}
                  onClick={() => setTemperature( item.name )}
                >
                  { item.name }
                </View>
              ) ) }
            </View>
          </View>

          {/* 糖度 */}
          <View className='mt-[32rpx]'>
            <Text>糖度</Text>

            <View className='flex gap-[24rpx] mt-[16rpx] text-primary-400'>
              { drinksSugar.map( item => (
                <View
                  key={item.name}
                  className={`px-[24rpx] py-[12rpx] rounded-[16rpx] ${ item.name === sugar ? 'text-primary-100 bg-primary-700' : 'border border-primary-400' }`}
                  onClick={() => setSugar( item.name )}
                >
                  { item.name }
                </View>
              ) ) }
            </View>
          </View>

          {/* 小料 */}
          <View className='mt-[32rpx]'>
            <Text>加料</Text>

            <View className='flex gap-[24rpx] mt-[16rpx] text-primary-400'>
              { drinksAddon.map( item => (
                <View
                  key={item.name}
                  className={`px-[24rpx] py-[12rpx] rounded-[16rpx] border ${ addon.includes( item.name ) ? 'text-primary-100 bg-primary-700 border-primary-700' : 'border-primary-400' }`}
                  onClick={() => handleAddon( item )}
                >
                  { item.name } ￥{ item.price }
                </View>
              ) ) }
            </View>
          </View>

          {/* 分隔线 */}
          <View className='my-[32rpx] border-t border-dashed border-primary-400' />

          {/* 数量价格 */}
          <View className='flex justify-between items-center'>
            <Text>￥{ totalPrice }</Text>

            <View className='flex justify-around items-center'>
              <Text
                className='iconfont icon-jianshao1 text-primary-400 text-[48rpx]'
                onClick={handleReduce}
              />
              <Text className='mx-[32rpx]'>{ count }</Text>
              <Text
                className='iconfont icon-tianjia3 text-primary-700 text-[48rpx]'
                onClick={handleAdd}
              />
            </View>
          </View>

          {/* 按钮 */}
          <View
            className='my-[40rpx] w-full h-[100rpx] text-primary-100 text-center leading-[100rpx] bg-primary-700 rounded-[50rpx]'
            onClick={addToCart}
          >
            加入购物车
          </View>
        </View>
      </View>

      {/* 购物车 */}
      <View className={`fixed left-0 bottom-0 w-full px-[32rpx] mb-[32rpx] z-99 ${ isShow ? '' : 'hidden' }`}>
        <View
          className='flex justify-between px-[48rpx] py-[24rpx] text-primary-100 bg-primary-700 rounded-full'
          onClick={handleCartDetails}
        >
          <View className='flex items-center gap-[24rpx]'>
            <View className='relative'>
              <Text className='iconfont icon-gouwugouwuchedinggou text-[56rpx]' />

              <View className='absolute top-[-16rpx] right-[-16rpx] w-[40rpx] h-[40rpx] text-primary-100 text-[28rpx] text-center leading-[40rpx] bg-red-500 rounded-full z-100'>{cartCount}</View>
            </View>

            <Text>预计到手 ￥{cartPrice}</Text>
          </View>

          <View
            className='flex items-center gap-[8rpx]'
            onClick={goToPayment}
          >
            <Text>去结算</Text>
            <Text className='iconfont icon-xiangyou1 text-[32rpx]' />
          </View>
        </View>
      </View>

      {/* 购物车详情 */}
      <View
        className={`mask flex items-end ${ showCartDetails ? '' : 'hidden' }`}
        onClick={hideCartDetailMask}
      >
        <View
          className='w-full bg-white rounded-t-[32rpx]'
          onClick={e => e.stopPropagation()}
        >
          {/* 顶部 */}
          <View className='flex justify-between items-center h-[80rpx] px-[48rpx] border-b border-dashed border-primary-400'>
            <View className='flex gap-[16rpx]'>
              <Checkbox color='#d29f7e' checked={checkAll} onClick={checkAllCommodity} />
              <Text>已选购商品（{ cartCount }件）</Text>
            </View>

            <View
              className='flex gap-[12rpx]'
              onClick={clearCart}
            >
              <Text className='iconfont icon-shanchu text-primary-400 text-[40rpx]' />
              <Text>清空购物车</Text>
            </View>
          </View>

          {/* 饮品列表 */}
          <View>
            { products.map( ( item, index ) => (
              <CartCommodityCard
                key={item.name}
                index={index}
                handleCartReduce={handleCartReduce}
                handleCartAdd={handleCartIncrease}
                handleCheckCommodity={handleCheckCommodity}
                {...item}
              />
            ) ) }
          </View>
        </View>
      </View>
    </View>
  )
}

export default Menu