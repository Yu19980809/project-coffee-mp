import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { View, Text, Input, Button, Image } from '@tarojs/components'
import { commonFunctions } from '@/constants'
import preview from '@/assets/images/my/preview.png'
import { login, updateUserInfo, fetchUploadParams } from '@/api/v1'
import './index.css'

const Profile = () => {
  // 用户信息
  const [isLogin, setIsLogin] = useState(false)
  const [user, setUser] = useState({})
  useDidShow(() => {
    const userInfo = Taro.getStorageSync('profile')
    if (!userInfo) return
    setUser(userInfo)
    setIsLogin(true)
  })

  // 用户信息弹窗相关参数
  const [ showUserInfo, setShowUserInfo ] = useState( false )
  const [ image, setImage ] = useState( preview )
  const [ nickname, setNickname ] = useState( '' )
  const [ tel, setTel ] = useState( '' )

  // 登录
  const handleLogin = () => {
    Taro.login({
      success: res => {
        if ( !res.code ) {
          console.log( '登录失败！' + res.errMsg )
          return
        }

        login({code: res.code})
          .then(response => {
            Taro.setStorageSync('accessToken', `Bearer ${response.accessToken}`)
            Taro.setStorageSync('refreshToken', response.refreshToken)

            if (response.isNew) {
              setShowUserInfo(true)
            } else {
              const userInfo = response.user
              setUser(userInfo)
              setIsLogin(true)
              Taro.setStorageSync('profile', userInfo)
            }
          })
      }
    })
  }

  // 选择图片
  const handleChooseAvatar = async (e) => {
    const img = e.detail.avatarUrl
    setImage(img)
    Taro.showLoading({title: '图片上传中...'})
    // 获取上传策略和签名
    fetchUploadParams()
      .then(res => uploadImg(img, e.timeStamp, res.data))
      .then(() => Taro.hideLoading())
  }

  // 上传图片
  const uploadImg = ( imgPath, timeStamp, params ) => {
    const { OSSAccessKeyId, policy, signature } = params
    const host = 'https://codedreamer-coffee.oss-cn-shanghai.aliyuncs.com'

    Taro.uploadFile({
      url: host,
      filePath: imgPath,
      name: 'file',
      formData: {
        key: `avatar/${ timeStamp }.jpeg`,
        OSSAccessKeyId,
        policy,
        signature
      },
      success: () => {
        setImage(`${ host }/avatar/${ timeStamp }.jpeg`)
      },
      fail: err => console.log('fail', err)
    })
  }

  // 保存用户信息
  const handleSubmit = () => {
    updateUserInfo({avatar: image, name: nickname, tel})
      .then(res => {
        Taro.setStorageSync('profile', JSON.stringify(res.data))
        setUser(res.data)
        setShowUserInfo(false)
        setImage(preview)
        setNickname('')
        setTel('')
        Taro.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        })
      })
  }

  return (
    <View className='relative h-screen p-[32rpx]'>
      {/* 顶部背景图 */}
      <View className='absolute top-0 left-0 w-full h-[500rpx] bg-gradient-to-t from-primary-200 to-primary-700 z-[-1]' />

      {/* 个人信息 */}
      <View className='flex justify-between items-center mt-[240rpx] z-[99]'>
        <View className='flex items-center gap-[16rpx]'>
          {/* <View className='w-[120rpx] h-[120rpx] bg-background rounded-full' /> */}
          <Image
            src={user.avatar}
            alt='avatar'
            className='w-[120rpx] h-[120rpx] bg-background rounded-full'
          />

          <View className='flex flex-col gap-[16rpx] text-primary-100'>
            <Text>{ !user ? 'Hello!' : user.name }</Text>
            <Text className='text-[24rpx]'>{ !user ? '登录可享受更多服务' : user.tel?.toString().replace( /(\d{3})\d{4}(\d{4})/, '$1****$2' ) }</Text>
          </View>
        </View>

        <View
          className={`px-[32rpx] py-[16rpx] text-primary-700 text-[28rpx] bg-white rounded-full ${isLogin ? 'hidden' : ''}`}
          onClick={handleLogin}
        >
          登录/注册
        </View>

        <View
          className={`px-[32rpx] py-[16rpx] text-primary-700 text-[28rpx] bg-white rounded-full ${isLogin ? '' : 'hidden'}`}
        >
          {user.is_vip === 'yes' ? '尊享会员' : '大众用户'}
        </View>
      </View>

      {/* 余额信息 */}
      <View className='flex justify-around items-center h-[120rpx] mt-[32rpx] px-[48rpx] bg-white rounded-[32rpx]'>
        <View className='flex flex-col items-center'>
          <Text>0</Text>
          <Text>余额</Text>
        </View>

        <View className='h-[60rpx] border-r border-primary-200' />

        <View className='flex flex-col items-center'>
          <Text>0</Text>
          <Text>积分</Text>
        </View>

        <View className='h-[60rpx] border-r border-primary-200' />

        <View className='flex flex-col items-center'>
          <Text>0</Text>
          <Text>优惠券</Text>
        </View>
      </View>

      {/* 常用功能 */}
      <View className='mt-[32rpx] p-[32rpx] bg-white rounded-[32rpx]'>
        <Text>常用功能</Text>

        <View className='grid grid-cols-4 gap-[32rpx] mt-[32rpx] px-[32rpx]'>
          { commonFunctions.map( ( item, index ) => (
            <View
              key={index}
              className='flex flex-col items-center gap-[24rpx] w-[]'
            >
              <View className='w-[64rpx] h-[64rpx] bg-background rounded-[16rpx]' />
              <Text className='text-[24rpx]'>{ item.name }</Text>
            </View>
          ) ) }
        </View>
      </View>

      {/* 水印 */}
      <View className='absolute bottom-0 left-0 w-full h-[60rpx] flex justify-center items-center mb-[32rpx]'>
        <Text className='text-dimWhite text-[24rpx]'>CodeDreamer提供技术支持</Text>
      </View>

      {/* 完善用户信息 */}
      <View
        className={`${ showUserInfo ? '' : 'hidden' } mask flex justify-center items-center`}
        onClick={() => setShowUserInfo( false )}
      >
        <View
          className='w-[70%] bg-white rounded-[32rpx] pb-[48rpx]'
          onClick={e => e.stopPropagation()}
        >
          <View className='h-[100rpx] text-center leading-[100rpx] bg-background rounded-t-[32rpx]'>设置用户昵称和头像</View>

          <View className='flex-col px-[32rpx] py-[24rpx]'>
            {/* 选择图片 */}
            <View className='relative flex justify-center items-center h-[200rpx] border border-primary-900 rounded-[8rpx]'>
              <Image
                src={image}
                className='w-[100rpx] h-[100rpx] object-contain'
                // onClick={ handleChooseAvatar }
              />

              <Button
                open-type='chooseAvatar'
                className='absolte top-0 left-0 w-full h-full z-[99]'
                onChooseAvatar={handleChooseAvatar}
              />
            </View>

            {/* 昵称 */}
            <Input
              type='text'
              placeholder='请输入您的昵称'
              className='h-[40rpx] mt-[40rpx] px-[24rpx] py-[16rpx] bg-background rounded-[8rpx]'
              onBlur={e => setNickname( e.detail.value )}
            />

            {/* 手机号码 */}
            <Input
              type='tel'
              placeholder='请输入您的手机号'
              className='h-[40rpx] mt-[40rpx] px-[24rpx] py-[16rpx] bg-background rounded-[8rpx]'
              onBlur={e => setTel( e.detail.value )}
            />

            {/* 确定按钮 */}
            <Button
              className='h-[60rpx] mt-[40rpx] text-primary-100 text-center leading-[60rpx] bg-primary-700 rounded-[30rpx]'
              onClick={handleSubmit}
            >
                保存
            </Button>

          </View>
        </View>
      </View>
    </View>
  )
}

export default Profile