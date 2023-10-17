import Taro, { useDidShow } from '@tarojs/taro'
import { View, Swiper, SwiperItem, Image, Text } from '@tarojs/components'
import { useState } from 'react'
import swiperOne from '@/assets/images/homepage/swiperOne.jpg'
import swiperTwo from '@/assets/images/homepage/swiperTwo.jpg'
import { actionCards } from '@/constants'
import { fetchTop3Drinks } from '@/api/v1'

// 轮播卡片
const ActionCard = ( { text1, text2, tag } ) => (
  <View className='flex justify-between items-center px-[48rpx] py-[16rpx] bg-white rounded-[32rpx]'>
    <View className='flex flex-col text-[32rpx]'>
      <Text>{ text1 }</Text>
      <Text>{ text2 }</Text>
      <Text className='mt-[8rpx] text-primary-400'># { tag }</Text>
    </View>

    <View className='w-[200rpx] h-[120rpx] bg-dimWhite rounded-[32rpx]' />
  </View>
)

// 饮品卡片
const DrinkCard = ( { index, _id, name, sales, image, price } ) => {
  const handleClick = () => {
    const drink = { _id, name, image, price }
    Taro.preload({routeType: 'drinkBoard', drink})
    Taro.switchTab( { url: '/pages/menu/index' } )
  }

  return (
    <View className={`${ index === 0 ? '' : 'mt-[32rpx]' } relative flex items-center px-[48rpx] py-[24rpx] bg-primary-200 rounded-[32rpx]`}>
      <Image
        src={image}
        alt={name}
        className='w-[120rpx] h-[120rpx] rounded-[32rpx]'
      />

      <View className='flex flex-col ml-[32rpx] py-[8rpx] text-[28rpx]'>
        <View className='flex flex-col'>
          <Text>{ name }</Text>
          <Text className='mt-[4rpx] text-primary-400 text-[24rpx]'>销量 { sales }</Text>
        </View>

        <View className='flex items-end gap-[8rpx] mt-[12rpx]'>
          <Text>￥{ price }</Text>
        </View>
      </View>

      <Text
        className='absolute right-[48rpx] bottom-[32rpx] iconfont icon-tianjia3 px-[16rpx] h-[48rpx] text-center leading-[48rpx] text-[36rpx] text-primary-400'
        onClick={handleClick}
      />
    </View>
  )
}

const Index = () => {
  const [top3drinks, setTop3drinks] = useState([])

  // 获取销量前三的饮品
  useDidShow(() => {
    fetchTop3Drinks().then(res => setTop3drinks(res.data))
  })

  // 点单
  const handleOrder = type => {
    Taro.preload({routeType: 'index', type})
    Taro.switchTab({url: '/pages/menu/index'})
  }

  return (
    <View className='relative'>
      {/* 顶部轮播 */}
      <Swiper circular autoplay className='h-[774rpx]'>
        <SwiperItem className='w-full h-full'>
          <Image src={swiperOne} className='w-full h-full object-cover' />
        </SwiperItem>

        <SwiperItem className='w-full h-full'>
          <Image src={swiperTwo} className='w-full h-full object-cover' />
        </SwiperItem>
      </Swiper>

      {/* 点单类型 */}
      <View className='absolute top-[720rpx] flex justify-around items-center w-[686rpx] mx-[32rpx] p-[48rpx] bg-white rounded-[32rpx]'>
        {/* 到店自取 */}
        <View
          className='flex flex-col text-center'
          onClick={() => handleOrder('自取')}
        >
          <Text className='text-[40rpx] font-bold'>到店自取</Text>
          <Text className='mt-[8rpx] text-primary-400 text-[24rpx] font-semibold'>在线点单线下自取</Text>
          <View className='w-[200rpx] h-[180rpx] mt-[32rpx] bg-gray-500 rounded-[32rpx]' />
        </View>

        {/* 分隔线 */}
        <View className='h-[240rpx] border-r-[2rpx] border-dimWhite' />

        {/* 外卖配送 */}
        <View
          className='flex flex-col text-center'
          onClick={() => handleOrder('外送')}
        >
          <Text className='text-[40rpx] font-bold'>外卖配送</Text>
          <Text className='mt-[8rpx] text-primary-400 text-[24rpx] font-semibold'>足不出户配送到家</Text>
          <View className='w-[200rpx] h-[180rpx] mt-[32rpx] bg-gray-500 rounded-[32rpx]' />
        </View>
      </View>

      <View className='px-[32rpx] pb-[32rpx]'>
        {/* 卡片轮播 */}
        <Swiper circular autoplay className='mt-[380rpx] h-[200rpx]'>
          { actionCards.map( item => (
            <SwiperItem key={item.tag} className='w-full h-full'>
              <ActionCard {...item} />
            </SwiperItem>
          ) ) }
        </Swiper>

        {/* 月度饮品榜单 */}
        <View className='mt-[32rpx] px-[48rpx] py-[32rpx] bg-white rounded-[32rpx]'>
          <Text className='mb-[40rpx] font-semibold'>10月好喝榜</Text>

          <View className='mt-[40rpx]'>
            { top3drinks?.map( ( drink, index ) => (
              <DrinkCard
                key={drink.name}
                index={index}
                {...drink}
              />
            ) ) }
          </View>
        </View>

        {/* 水印 */}
        <View className='mt-[32rpx] w-full h-[60rpx] flex justify-center items-center'>
          <Text className='text-dimWhite text-[24rpx]'>CodeDreamer提供技术支持</Text>
        </View>
      </View>
    </View>
  )
}

export default Index
