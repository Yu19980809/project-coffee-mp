import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { View, Text, Image, Radio, Textarea } from '@tarojs/components'
import useCartStore from '@/store/cartStore'
import {
  generateOrder,
  fetchDefaultAddress,
  fetchNearestShop
} from '@/api/v1'
import './index.css'

// 自取/外送 切换组件
const SwitchButton = ({orderType, handleClickOrderType}) => (
  <View className='flex justify-between text-[28rpx] bg-background rounded-[32rpx]'>
    <Text
      className={`px-[24rpx] py-[12rpx] ${ orderType === '自取' ? 'bg-primary-700 text-primary-100 rounded-[32rpx]' : '' }`}
      onClick={() => handleClickOrderType('自取')}
    >
      自取
    </Text>

    <Text
      className={`px-[24rpx] py-[12rpx] ${ orderType === '外送' ? 'bg-primary-700 text-primary-100 rounded-[32rpx]' : '' }`}
      onClick={() => handleClickOrderType('外送')}
    >
      外送
    </Text>
  </View>
)

// 商品卡片
const CommodityCard = ({name, temperature, sugar, addon, image, count, price, addonPrice}) => (
  <View className='flex items-center px-[48rpx] py-[24rpx] rounded-[32rpx]'>
    <Image
      src={image}
      alt={name}
      className='w-[120rpx] h-[120rpx] rounded-[32rpx]'
    />

    <View className='flex flex-1 justify-between items-center ml-[32rpx] py-[8rpx]'>
      <View className='flex flex-col gap-[16rpx]'>
        <View className='flex flex-col gap-[4rpx]'>
          <Text className='text-[28rpx]'>{name}</Text>
          {temperature !== '' && (
            <Text className='block mt-[4rpx] text-primary-400 text-[24rpx]'>
              {temperature}/{sugar}{addon.length === 0 ? '' : `/${addon.join(',')}`}
            </Text>
          )}
        </View>
      </View>

      <View className='flex flex-col items-end gap-[16rpx] text-primary-400'>
        <Text className='text-primary-700'>￥{price + addonPrice}</Text>
        <Text className='text-[24rpx]'>x {count}</Text>
      </View>
    </View>
  </View>
)

const Payment = () => {
  // 从store中获取所有cart信息
  const {products, price: cartPrice, count: cartCount, clear, hideCart} = useCartStore()

  const [orderType, setOrderType] = useState('自取')  // 订单类型
  const [orderAddress, setOrderAddress] = useState({})  // 订单地址
  const [orderShop, setOrderShop] = useState({})  // 订单门店
  const [paymentWay, setPaymentWay] = useState('账户余额') // 付款方式
  const [showPaymentWay, setShowPaymentWay] = useState(false) // 是否显示付款方式选择窗口
  const [showComment, setShowComment] = useState(false) // 是否显示留言窗口
  const [needNoTouch, setNeedNoTouch] = useState(false) // 是否需要非接触配送
  const [needNapkin, setNeedNapkin] = useState(false) // 是否需要纸巾
  const [comment, setComment] = useState('')  // 留言内容
  const [commentInfo, setCommentInfo] = useState('')  // 整体的留言信息

  // 获取路由参数
  useDidShow(() => {
    const data = Taro.getCurrentInstance().preloadData
    if (!data) return

    const {routeType} = data
    switch (routeType) {
      // 由菜单页跳转而来
      case 'menu':
        const {type, address, shop} = data
        setOrderType(type)
        setOrderAddress(address)
        setOrderShop(shop)
        break
      // 由门店页跳转而来
      case 'reselectShop':
        const {shop: reselectShop} = data
        setOrderShop(reselectShop)
        break
      // 由地址列表页跳转而来
      case 'reselectAddress':
        const {address: reselectAddress} = data
        setOrderAddress(reselectAddress)
        break
      default:
    }

    Taro.preload(null)
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

  // 处理备注内容
  const handleComment = () => {
    let info = []
    if (comment !== '') info.push(comment)
    if (needNoTouch) info.push('需要无接触配送')
    if (needNapkin) info.push('需要纸巾')
    setCommentInfo(info.join(','))
    setShowComment(false)
  }

  // 支付
  const handlePayment = () => {
    const data ={
      type: orderType,
      address: JSON.stringify(orderAddress),
      status: '制作中',
      shop: JSON.stringify(orderShop),
      price: cartPrice,
      count: cartCount,
      payment: paymentWay,
      note: commentInfo,
      commodities: JSON.stringify(products.filter(item => item.checked))
    }

    generateOrder(data).then(() => {
      Taro.switchTab({url: '/pages/order/index'})
      hideCart()
      clear()
    })
  }

  return (
    <View className='relative flex flex-col h-screen'>
      {/* 头部 */}
      <View className='flex justify-between items-center w-full h-[120rpx] px-[32rpx] py-[16rpx] bg-white border-b border-background z-99'>
        {/* 自取 */}
        <View
          className={`flex flex-col justify-around items-start ${ orderType === '自取' ? '' : 'hidden' }`}
          onClick={() => Taro.navigateTo( { url: '/packageA/pages/shop/index' } )}
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
            Taro.preload({from: 'payment'})
            Taro.navigateTo({url: '/packageA/pages/address/show/index'})
          }}
        >
          <View>
            <Text>{orderAddress.location + orderAddress.door}</Text>
            <Text className='ml-[8rpx] iconfont icon-xiangyou1 text-[32rpx]' />
          </View>

          <View className='flex items-center gap-[24rpx] mt-[8rpx] text-primary-400 text-[24rpx]'>
            <Text>{orderAddress.tel}</Text>
            <Text>{orderAddress.name}</Text>
          </View>
        </View>

        <SwitchButton
          orderType={orderType}
          setOrderType={setOrderType}
          handleClickOrderType={handleClickOrderType}
        />
      </View>

      {/* 主体内容区域 */}
      <View className='px-[32rpx] pb-[32rpx]'>
        {/* 商品列表 */}
        <View className='mt-[24rpx] bg-white rounded-t-[32rpx]'>
          {products.filter(item => item.checked).map(item => (
            <CommodityCard
              key={item._id}
              {...item}
            />
          ))}
        </View>

        {/* 优惠券 */}
        <View className='relative flex justify-between items-center px-[32rpx] py-[32rpx] bg-white border-t border-dashed border-primary-200 rounded-b-[32rpx]'>
          <Text>优惠券</Text>

          <View className='flex items-center gap-[8rpx] text-primary-400 text-[28rpx]'>
            <Text>暂无可用优惠券</Text>
            <Text className='iconfont icon-xiangyou1' />
          </View>

          <View className='absolute left-[-16rpx] top-[-16rpx] w-[32rpx] h-[32rpx] bg-background rounded-full' />
          <View className='absolute right-[-16rpx] top-[-16rpx] w-[32rpx] h-[32rpx] bg-background rounded-full' />
        </View>

        {/* 备注 */}
        <View className='relative flex justify-between items-center mt-[24rpx] px-[32rpx] py-[32rpx] bg-white rounded-[32rpx]'>
          <Text>备注</Text>

          <View
            className='flex items-center gap-[8rpx] text-primary-400 text-[28rpx]'
            onClick={() => setShowComment(true)}
          >
            <View className={`${ ( !needNoTouch && !needNapkin && !comment ) ? '' : 'hidden' }`}>
              <Text>给商家留言</Text>
              <Text className='iconfont icon-xiangyou1' />
            </View>

            <View className={`${ ( needNoTouch || needNapkin || comment !== '' ) ? '' : 'hidden' } text-primary-900`}>
              <Text className='w-[400rpx] ellipse'>
                {commentInfo}
              </Text>
              <Text className='iconfont icon-xiangyou1' />
            </View>
          </View>
        </View>

        {/* 支付方式 */}
        <View className='relative flex justify-between items-center mt-[24rpx] px-[32rpx] py-[32rpx] bg-white rounded-[32rpx]'>
          <Text>付款方式</Text>

          <View
            className='flex items-center text-[28rpx]'
            onClick={() => setShowPaymentWay(true)}
          >
            <View className='w-[32rpx] h-[32rpx] mr-[4rpx] bg-background rounded-[8rpx]' />
            <Text>{paymentWay}</Text>
            <Text className='iconfont icon-xiangyou1 ml-[8rpx]' />
          </View>
        </View>
      </View>

      {/* 底部 */}
      <View className='absolute left-0 bottom-0 flex justify-between items-center w-full h-[120rpx] px-[48rpx] py-[16rpx] bg-white'>
        <Text>应付 <Text className='text-[36rpx] text-primary-700'>￥{cartPrice}</Text></Text>

        <View
          className='flex justify-center items-center w-[240rpx] h-[80rpx] text-primary-100 bg-primary-700 rounded-[40rpx]'
          onClick={handlePayment}
        >
          去支付
        </View>
      </View>

      {/* 选择付款方式 */}
      <View
        className={`${ showPaymentWay ? '' : 'hidden' } mask flex items-end w-full px-[32rpx] pb-[150rpx]`}
        onClick={() => setShowPaymentWay(false)}
      >
        <View
          className='w-full bg-white rounded-[32rpx]'
          onClick={e => e.stopPropagation()}
        >
          <View className='w-full h-[120rpx] text-center leading-[120rpx] bg-background rounded-t-[32rpx]'>支付中心</View>

          {/* 账户余额 */}
          <View
            className='px-[32rpx] py-[16rpx]'
            onClick={() => setPaymentWay('账户余额')}
          >
            <View className='flex justify-between items-center text-primary-400'>
              <View className='flex items-center gap-[8rpx]'>
                <View className='w-[96rpx] h-[96rpx] bg-background rounded-[32rpx]' />
                <Text className='text-primary-900'>账户余额</Text>
                <Text className='text-[24rpx]'>(￥0)</Text>
              </View>

              <Radio color='#87451b' checked={paymentWay === '账户余额'} />
            </View>
          </View>

          {/* 微信支付 */}
          <View
            className='px-[32rpx] py-[16rpx]'
            onClick={() => setPaymentWay('微信支付')}
          >
            <View className='flex justify-between items-center text-primary-400'>
              <View className='flex items-center gap-[16rpx]'>
                <View className='w-[96rpx] h-[96rpx] bg-background rounded-[32rpx]' />
                <Text className='text-primary-900'>微信支付</Text>
                <View className='px-[8rpx] py-[4rpx] text-primary-100 text-[24rpx] bg-primary-700 rounded-[8rpx]'>推荐</View>
              </View>

              <Radio color='#87451b' checked={paymentWay === '微信支付'} />
            </View>
          </View>
        </View>
      </View>

      {/* 备注 */}
      <View
        className={`${ showComment ? '' : 'hidden' } mask flex items-end p-[32rpx]`}
        onClick={() => setShowComment( false )}
      >
        <View
          className='w-full bg-white rounded-[32rpx]'
          onClick={e => e.stopPropagation()}
        >
          <View className='h-[120rpx] text-center leading-[120rpx] bg-background rounded-t-[32rpx]'>订单备注</View>

          <View className='flex-col px-[32rpx] py-[24rpx]'>
            {/* 无接触配送 */}
            <View className='flex py-[24rpx]'>
              <Text>无接触配送：</Text>

              <View className='flex gap-[16rpx] ml-[16rpx] text-[24rpx]'>
                <View
                  className={`px-[16rpx] py-[4rpx] rounded-[8rpx] ${ needNoTouch ? 'text-primary-700 border border-primary-700' : 'bg-primary-700 text-primary-100' }`}
                  onClick={() => setNeedNoTouch(false)}
                >
                  不需要
                </View>

                <View
                  className={`px-[16rpx] py-[4rpx] rounded-[8rpx] ${ needNoTouch ? 'bg-primary-700 text-primary-100' : 'text-primary-700 border border-primary-700' }`}
                  onClick={() => setNeedNoTouch(true)}
                >
                  需要
                </View>
              </View>
            </View>

            {/* 纸巾 */}
            <View className='flex py-[24rpx]'>
              <Text>纸巾：</Text>

              <View className='flex gap-[16rpx] ml-[16rpx] text-[24rpx]'>
                <View
                  className={`px-[16rpx] py-[4rpx] rounded-[8rpx] ${ needNapkin ? 'text-primary-700 border border-primary-700' : 'bg-primary-700 text-primary-100' }`}
                  onClick={() => setNeedNapkin(false)}
                >
                  不需要
                </View>

                <View
                  className={`px-[16rpx] py-[4rpx] rounded-[8rpx] ${ needNapkin ? 'bg-primary-700 text-primary-100' : 'text-primary-700 border border-primary-700' }`}
                  onClick={() => setNeedNapkin(true)}
                >
                  需要
                </View>
              </View>
            </View>

            {/* 输入框 */}
            <View className='py-[24rpx]'>
              <Textarea
                style='height:80rpx;padding:24rpx;font-size:24rpx;background-color:#f4f4f4;border-radius:8rpx;overflow-y:scroll;'
                placeholder='请输入备注内容'
                maxlength={50}
                onInput={e => setComment(e.detail.value)}
              />
            </View>

            {/* 确定按钮 */}
            <View
              className='h-[60rpx] text-primary-100 text-center leading-[60rpx] bg-primary-700 rounded-[30rpx]'
              onClick={handleComment}
            >
              确认
          </View>

          </View>
        </View>
      </View>
    </View>
  )
}

export default Payment