'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Zap, Laugh, Frown, Bolt } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "@/components/ui/select"
import axios from 'axios'
import { ScrollArea } from "@/components/ui/scroll-area"
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle,DialogTrigger} from "@/components/ui/dialog"
import { Alert, AlertTitle, AlertDescription } from './components/ui/alert'

//private imports
import { CardAlert } from './fragments/Alerts'

export default function Component() {
  const [connectionDetails, setConnectionDetails] = useState({
    name: '',
    password: '',
    host: '',
    port: '',
    defaultDb: ''
  })
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  // const [useSSL, setUseSSL] = useState(false)

  const [query, setQuery] = useState('')
  const [collectionName, setCollectionName]= useState('')
  const [insertDocument, setInsertDocument] = useState('')

  const [collectionSetting,setCollectionSetting] = useState(false)
  const [collectionList, setCollectionList] = useState([])
  
  const [newUser, setNewUser] = useState({ username: '', password: '', role: '' })
  const [isWideScreen, setIsWideScreen] = useState(true)

  //alert
  const [showAlert, setShowAlert] = useState(false)
  const [stateAlert,setStateAlert]=useState(false)
  type AlertVariant = 'default' | 'destructive'; // Add other variants as necessary
  const [alertInfo, setAlertInfo] = useState<[any,any, AlertVariant, string, string]>([null,'', 'default', '', '']);//[Icon,IconColor,type,title,description,]

  //confirmation-alert
  const [showConfirm,setShowConfirm]= useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsWideScreen(window.innerWidth >= 640)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConnectionDetails({
      ...connectionDetails,
      [e.target.name]: e.target.value
    })
  }

  const setAlert = (Icon:React.ElementType,Color:any,type:AlertVariant,title:string,description:string) => {
    setAlertInfo([Icon,Color,type,title,description])
    setShowAlert(true)
    setStateAlert(true)
  }

  useEffect(() => {
    if(showAlert){
      setTimeout(()=>{
        setStateAlert(false)
      },2500)
    }
  }, [showAlert])

  useEffect(() => {
    if(!stateAlert){
      setTimeout(()=>{
        setAlertInfo([null, '', 'default', '', ''])
        setShowAlert(false)
      },300)
    }
  }, [stateAlert])

  const handleConnect = async () => {
    setIsLoading(true);
    try {
        const response = await axios.post(
            `http://172.16.11.74:8885/db/connect`,
            {
                username: connectionDetails.name,
                password: connectionDetails.password,
                host: connectionDetails.host,
                port: connectionDetails.port,
                default_db: connectionDetails.defaultDb,
            },
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log(connectionDetails); // Logging connection details

        if (response.status === 200) {
            setAlert(Laugh, "#0c910c", "default", 'Connected', 'Successfully connected to the database.');
            setIsConnected(true);
        } else {
            // Handle other statuses if needed
            console.log("Unexpected response:", response.data);
        }
    } catch (err: any) {
        let description ='Oops, something happened?'
        if (axios.isAxiosError(err) && err.response) {
            console.error("Error response data:", err.response.data);
            if(err.response.data.detail=="Authentication failed"){description="Unable to connect, check your username or password or database"}
            else if(err.response.data.detail=="Host not found"){description="Unable to connect with mongodb server, check your host and port."}
        } else {
            description="An unexpected error occurred, please try again later"
            console.error("An unexpected error occurred:", err);
      }
      setAlert(Frown, "#c31313", "destructive", 'Connection Failed', description)
    }
    finally{
      setIsLoading(false)
    }
  //   try {
  //     // Simulating API call to connect to the database
  //     await new Promise(resolve => setTimeout(resolve, 1500))
  //     setIsConnected(true)
  //   } catch (err) {
  //     setError('Failed to connect to the database. Please check your credentials and try again.')
  //   } finally {
  //     setIsLoading(false)
  //   }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setConnectionDetails({
      name: '',
      password: '',
      host: '',
      port: '',
      defaultDb: ''
    })
    setShowConfirm(false)
  }

  const handleTabChange = (tab:string) =>{
    if(tab === "read"){
      //get api of all collections and 
    }
  }

  const handleCreate = async () => {
    // Implement document insertion logic here
    console.log('collection name:', collectionName)
    console.log('Inserting document:', insertDocument)
  }

  const handleQuery = async () => {
    // Implement query execution logic here
    console.log('Executing query:', query)
  }

  const handleSellectCollection = ()=>{
    console.log('selecting collection')
  }

  const handleCreateUser = async () => {
    // Implement user creation logic here
    console.log('Creating user:', newUser)
  }

  const alertVariants = {
    hidden: { opacity: 0, y: -20 }, // Start hidden and slightly above
    visible: { opacity: 1, y: 0 }, // Fully visible at its original position
    exit: { opacity: 0, y: -20 }, // Exit with fade and slide up
  };

  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-white to-green-50 flex items-center justify-center p-4">
      {showConfirm && <CardAlert setActive={setShowConfirm} fx={handleDisconnect} active={showConfirm} title='Confirm' description='Are you sure you want to disconnect?'/>}
      
      <motion.div className='mb-4 w-auto grid top-2 fixed'>
      {showAlert && (
        <motion.div
          variants={alertVariants}
          initial="hidden"
          animate={stateAlert ? "visible" : "hidden"}
          exit={{opacity:0, height:0}}
          transition={{ duration: 0.2 }} // Adjust duration for speed
        >
          <Alert className='w-auto' variant={alertInfo[2]}>
            {alertInfo[0] && React.createElement(alertInfo[0], { className: 'h-8 w-8 stroke-2', stroke: alertInfo[1] })} {/* Correctly render the icon */}
            <AlertTitle className='ml-5'>{alertInfo[3]}</AlertTitle>
            <AlertDescription className='ml-5'>
              {alertInfo[4]}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </motion.div>
      <motion.div className="w-full max-w-lg shadow-2xl rounded-xl bg-white" layout transition={{duration:0.4}}>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-green-600 flex items-center justify-center gap-1">
            <Zap className="h-20 w-12" />
            Fastmon
          </CardTitle>
          <CardDescription>
            A simple web client for your MongoDb.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {!isConnected ? (
              <motion.form
                key="connection-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={(e) => e.preventDefault()}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Username</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={connectionDetails.name} 
                    onChange={handleInputChange}
                    placeholder="Enter username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    value={connectionDetails.password} 
                    onChange={handleInputChange}
                    placeholder="Enter password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="host">Host</Label>
                  <Input 
                    id="host" 
                    name="host" 
                    value={connectionDetails.host} 
                    onChange={handleInputChange}
                    placeholder="e.g., localhost or 127.0.0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input 
                    id="port" 
                    name="port" 
                    value={connectionDetails.port} 
                    onChange={handleInputChange}
                    placeholder="e.g., 27017"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultDb">Database</Label>
                  <Input 
                    id="defaultDb" 
                    name="defaultDb" 
                    value={connectionDetails.defaultDb} 
                    onChange={handleInputChange}
                    placeholder="Enter database name"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  {/* <Switch
                    id="ssl-mode"
                    checked={useSSL}
                    onCheckedChange={setUseSSL}
                  /> */}
                  {/* <Label htmlFor="ssl-mode">Use SSL</Label> */}
                </div>
                <Button onClick={handleConnect} className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
                  {isLoading ? 'Connecting...' : 'Connect to Database'}
                </Button>
              </motion.form>
            ) : (
              <motion.div
                key="connected-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex flex-row items-center">
                  <div className='flex w-full flex-col gap-2'>
                  <h2 className="text-sm font-bold text-green-600 text-left">
                    <span className='text-gray-700 font-medium'>Connected to: </span>
                    {connectionDetails.defaultDb || 'admin'}
                  </h2>
                  <Button className='' onClick={()=>{setShowConfirm(true)}} variant="outline">
                    Disconnect
                  </Button>
                  </div>
                </div>
                <Tabs defaultValue="create" onValueChange={handleTabChange} className="w-full">
                  <TabsList className={`h-full w-full ${isWideScreen ? 'flex' : 'grid grid-cols-1 gap-2'}`}>
                    <TabsTrigger value="query" className="flex-1 py-2 px-4">Query</TabsTrigger>
                    <TabsTrigger value="create" className="flex-1 py-2 px-4">Create</TabsTrigger>
                    <TabsTrigger value="read" className="flex-1 py-2 px-4">Select</TabsTrigger>
                    {/* <TabsTrigger value="update" className="flex-1 py-2 px-4">Update</TabsTrigger>
                    <TabsTrigger value="Delete" className="flex-1 py-2 px-4">Delete</TabsTrigger> */}
                    {/* <TabsTrigger value="createUser" className="flex-1 py-2 px-4">Create User</TabsTrigger> */}
                  </TabsList>
                  <AnimatePresence mode="wait">

                  {/* #### Query Tab ####  */}
                  <TabsContent value="query" key="query" className="space-y-4 mt-6">
                  <motion.div
                        key="query-motion"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h3 className="text-lg font-semibold mb-2">Execute Query</h3>
                        <Textarea
                          placeholder="Enter MongoDB query"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          className="min-h-[100px] mb-2"
                        />
                        <h3 className="text-lg font-semibold mb-2">Result</h3>
                        <Textarea
                          className="min-h-[100px] mb-4"
                        />
                        <Button onClick={handleQuery} className="w-full">Execute Query</Button>
                      </motion.div>
                    </TabsContent>

                    {/* #### Create tab #### */}
                    <TabsContent value="create" key="create" className="space-y-4 mt-6">
                      <motion.div
                        key="create-motion"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h3 className="text-lg font-semibold mb-2">Collection Name</h3>
                        <Input 
                          className="mb-4"
                          value={collectionName}
                          onChange={(e) => setCollectionName(e.target.value)}
                        ></Input>
                        <h3 className="text-lg font-semibold mb-2">Insert Document</h3>
                        <Textarea
                          placeholder="Enter JSON document to insert"
                          value={insertDocument}
                          onChange={(e) => setInsertDocument(e.target.value)}
                          className="min-h-[150px] mb-4"
                        />
                        <Button onClick={handleCreate} className="w-full">Insert Document</Button>
                      </motion.div>
                    </TabsContent>

                    {/* #### Select tab #####*/}
                    <TabsContent value="read" key="read" className="space-y-4 mt-6">
                      <motion.div
                        key="read-motion"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h3 className='text-lg font-semibold mb-4'>Select Collection</h3>
                        <div className='mb-4 grid-cols-6 grid gap-2'>
                          <div className='col-span-5'>
                          <Select onValueChange={handleSellectCollection}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a collection" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="collection1">Collection 1</SelectItem>
                              <SelectItem value="collection2">Collection 2</SelectItem>
                              <SelectItem value="collection3">Collection 3</SelectItem>
                            </SelectContent>
                          </Select>
                          </div>
                            <Dialog>
                              <DialogTrigger><Button variant="secondary" className='w-full'><Bolt/></Button></DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Collection Settings</DialogTitle>
                                  <DialogDescription>
                                    Make changes to your selected collection.
                                  </DialogDescription>
                                    <div className='grid grid-row'>
                                      <Label className='mt-5'>Edit name</Label>
                                      <div className='mt-2 grid grid-cols-4 gap-2'>
                                        <Input className='col-span-3'></Input>
                                        <Button variant={"secondary"} className='col-span-1'>Save</Button>
                                      </div>
                                      <Button className='mt-5' variant={'destructive'}>remove</Button>
                                    </div>
                                </DialogHeader>
                              </DialogContent>
                            </Dialog>
                          </div>
                        <h3 className="text-lg font-semibold mb-4">Documents</h3>
                        {/* <motion.div className='mb-4 h-[180px] shadow-inner flex flex-col space-y-2 rounded-md overflow-y-auto'>
                          <Button variant="ghost" className=' w-full'>sdf</Button>
                          <Button variant="ghost" className=' w-full'>sdf</Button>
                          <Button variant="ghost" className=' w-full'>sdf</Button>
                          <Button variant="ghost" className=' w-full'>sdf</Button>
                          <Button variant="ghost" className=' w-full'>sdf</Button>
                        </motion.div> */}
                        <ScrollArea className='mb-4 h-[180px] outline outline-gray-200 outline-1 flex flex-col rounded-sm'>
                          <Button variant="ghost" className=' w-full'>sdf</Button>
                          <Button variant="ghost" className=' w-full'>sdf</Button>
                          <Button variant="ghost" className=' w-full'>sdf</Button>
                          <Button variant="ghost" className=' w-full'>sdf</Button>
                          <Button variant="ghost" className=' w-full'>sdf</Button>
                          <Button variant="ghost" className=' w-full'>sdf</Button>
                        </ScrollArea>
                      </motion.div>
                    </TabsContent>
                    <TabsContent value="createUser" key="createUser" className="space-y-4 mt-6">
                      <motion.div
                        key="createUser-motion"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h3 className="text-lg font-semibold mb-4">Create User</h3>
                        <div className="space-y-4">
                          <Input
                            placeholder="Username"
                            value={newUser.username}
                            onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                          />
                          <Input
                            type="password"
                            placeholder="Password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                          />
                          <Input
                            placeholder="Role"
                            value={newUser.role}
                            onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                          />
                        </div>
                        <Button onClick={handleCreateUser} className="w-full mt-4">Create User</Button>
                      </motion.div>
                    </TabsContent>
                  </AnimatePresence>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>

          {/* {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-6 p-4 bg-red-100 text-red-700 rounded-md flex items-center"
            >
              <AlertCircle className="mr-2 h-5 w-5" />
              {error}
            </motion.div>
          )} */}
        </CardContent>
      </motion.div>
    </motion.div>
  )
}