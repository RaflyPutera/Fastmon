import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Zap, Laugh, Frown, Pen, Trash } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from 'axios'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Alert, AlertTitle, AlertDescription } from './components/ui/alert'
import { useToast } from "@/hooks/use-toast"
import CodeMirror from '@uiw/react-codemirror'
import { json } from "@codemirror/lang-json"

import { CardAlert } from './fragments/Alerts'
import { Document } from './fragments/Document'


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


  const [collectionName, setCollectionName]= useState('')
  const [insertDocument, setInsertDocument] = useState('')

  const [collectionList, setCollectionList] = useState([])
  const [activeCollection, setActiveCollection]=useState("")
  const [documentList, setDocumentList] = useState<any>([])
  const [newName,setNewName]=useState("")
  const [openDocument, setOpenDocument] = useState(false)
  const [activeDocument,setActiveDocument]=useState('')
  const [documentData, setDocumentData]=useState('')
  const [checkRoot, setCheckRoot]=useState(false)
  const [selectDocument, setSelectDocument]=useState<string[]>([]);
  

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

  const {toast} = useToast()

  const handleConnect = async () => {
    setIsLoading(true);
    try {
        const response = await axios.post(
            `http://localhost:8885/db/connect`,
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

  const handleTabChange = async (tab:string) =>{
    if(tab === "read"){
      setCollectionList([])
      setDocumentList([])
      setActiveCollection("")
      setSelectDocument([])
      await getCollections()
    }
  }

  const handleCreate = async () => {
    // Implement document insertion logic here
    let title:string = ''
    let description:string = ''
    let variant:string='default'

    if(!collectionName){
      title='Failed to insert document!'
      variant='destructive'
      description="Collection name cannot be empty."
    }
    else{
      try{
        const ss=JSON.parse(insertDocument)
        const response = await axios.post(
          `http://localhost:8885/db/create`,
          {
            collection: collectionName,
            document: insertDocument,
          },
          { headers: { 'Content-Type': 'application/json' } }
        );
        if(response.status===200){
          title='Successfully inserted document!'
          description='Document created successfully.'
          variant='default'
          setCollectionName('')
          setInsertDocument('')
        }
      }
      catch(err:any){
        title='Failed to insert document!'
        variant='destructive'
        description='Please, check the format of the inserted document.'
    
      }
    }
    toast({
      title: title,
      description: description,
      variant: variant as any
    })
  }

  async function getCollections() {
    const response = await axios.get(
      `http://localhost:8885/db/list_collections`,
      { headers: { 'Content-Type': 'application/json' } }
    );
    if(response.status==200){
      setCollectionList(response.data.collections)
    }
  }

  async function SelectCollection(value:string){
    const responses = await axios.get(
      `http://localhost:8885/db/select_collection`,
      {
        params: {
          collection: value,
        },
        headers: { 'Content-Type': 'application/json' }
      }
    )
    const documents = responses.data
    // console.log(documents)
    for (const document of documents) {
      //push document in setdocument
      setDocumentList((prevDocuments:any) => [...prevDocuments, document]);
    }
  }

  const handleSelectCollection = async (value:string)=>{
    setSelectDocument([])
    setDocumentList([])
    setActiveCollection(value)
    if(value){
      await SelectCollection(value)
    }
  }

  const handleCollectionRename=async ()=>{
    let title="Failed to rename collection"
    let description="An error occured, please try again later"
    let variant="destructive"
    const response = await axios.post(
      `http://localhost:8885/db/collection/edit`,
      {
        option:"rename",
        collection_name: activeCollection,
        new_name: newName,
      },
      { headers: { 'Content-Type': 'application/json' } }
    )
    if(response.status===200){
      title="Successfully renamed collection"
      description="Collection renamed successful to "+newName
      variant="default"
    }
    toast({
      title: title,
      description: description,
      variant: variant as any
    })
    await getCollections()
    setNewName("")
    setActiveDocument(newName)
  
  }

  const handleDeleteCollection= async ()=>{
    let title="Failed to drop collection"
    let description="An error occured, please try again later"
    let variant="destructive"
    const response = await axios.post(
      `http://localhost:8885/db/collection/edit`,
      {
        option:"delete",
        collection_name: activeCollection,
      },
      { headers: { 'Content-Type': 'application/json' } }
    )
    if(response.status===200){
      title="Successfully dropped collection"
      description="The collection "+activeCollection+" has been dropped."
      variant="default"
    }
    toast({
      title: title,
      description: description,
      variant: variant as any
    })
    await getCollections()
    setActiveCollection("")
    setDocumentList([])
  }

  const handleDeleteDocument=async()=>{
    let title="Failed to delete document'"
    let description="An error occured, please try again later"
    let variant="destructive"
    const response = await axios.post(
      `http://localhost:8885/db/document/edit`,
      {
        option:"delete",
        collection: activeCollection,
        selected_ids: selectDocument,
      },
      { headers: { 'Content-Type': 'application/json' } }
    )
    if(response.status===200){
      title="Successfully dropped document"
      description="Document have been dropped."
      variant="default"
    }
    toast({
      title: title,
      description: description,
      variant: variant as any
    })
    setSelectDocument([])
    setDocumentList([])
    setOpenDocument(false)
    await SelectCollection(activeCollection)
  }

  const handleUpdateDocument=async()=>{
    let title="Failed to update document'"
    let description="Please make sure the format is correct"
    let variant="destructive"
    console.log(activeCollection,activeDocument,documentData)
    const response = await axios.post(
      `http://localhost:8885/db/document/edit`,
      {
        option:"update",
        collection: activeCollection,
        document_id: activeDocument,
        document_update: documentData
      },
      { headers: { 'Content-Type': 'application/json' } }
    )
    if(response.status===200){
      title="Successfully updated"
      description="Document have been update"
      variant="default"
    }
    toast({
      title: title,
      description: description,
      variant: variant as any
    })
    setSelectDocument([])
    setDocumentList([])
    setOpenDocument(false)
    await SelectCollection(activeCollection)
  }

  useEffect(()=>{
    if(openDocument){
      setSelectDocument([activeDocument])
      const fetchData = async()=>{
        const response = await axios.get(
          `http://localhost:8885/db/get_document`,
          {
            params: {
              collection: activeCollection,
              document_id: activeDocument,
            },
            headers: { 'Content-Type': 'application/json' }
          }
        )
        console.log(response)
        let data = JSON.stringify(response.data,null,2)
        setDocumentData(data)
        console.log(documentData)
      }
      fetchData()
    }else{
      setSelectDocument([])
    }
  },[openDocument])

  useEffect(()=>{
    setTimeout(()=>{
      setSelectDocument([])
      setCheckRoot(false)
    },60)
  },[checkRoot])


  const alertVariants = {
    hidden: { opacity: 0, y: -20 }, // Start hidden and slightly above
    visible: { opacity: 1, y: 0 }, // Fully visible at its original position
    exit: { opacity: 0, y: -20 }, // Exit with fade and slide up
  };

  const formatDocument = (document: any) => {
    return Object.keys(document)
      .filter((key) => key !== '_id') // Exclude _id
      .map((key) => {
        const value = document[key];
        // If the value is an object, stringify it, otherwise just return the value
        return `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`;
      })
      .join(', ');
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
                    <TabsTrigger value="create" className="flex-1 py-2 px-4">Create</TabsTrigger>
                    <TabsTrigger value="read" className="flex-1 py-2 px-4">Select</TabsTrigger>
                  </TabsList>
                  <AnimatePresence mode="wait">
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
                        <CodeMirror
                          height="120px"
                          className='mb-4'
                          extensions={[json()]}
                          value={insertDocument}
                          onChange={(value:string) => setInsertDocument(value)}
                          theme="dark"
                        />
                        <Button variant={"outline"} onClick={handleCreate} className="w-full">Insert Document</Button>
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
                        <div className='mb-4 grid-cols-8 grid gap-2'>
                          <div className='col-span-6'>
                          <Select onValueChange={handleSelectCollection}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a collection" />
                            </SelectTrigger>
                             <SelectContent>
                              {collectionList.length > 0 ? (
                                collectionList.map((collection, index) => (
                                  <SelectItem key={index} value={collection}>
                                    {collection}
                                  </SelectItem>
                                ))
                              ):(<SelectItem value="No collections found" disabled></SelectItem>)}
                            </SelectContent>
                          </Select>
                          </div>
                          <div className='col-span-1'>
                            <Dialog>
                              <DialogTrigger className='w-full h-full outline outline-1 outline-gray-300  rounded-md items-center justify-center flex'><Pen size={"20px"} color='#3b3b3b'/></DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Collection</DialogTitle>
                                  <DialogDescription>
                                    Change the name of the selected collection
                                  </DialogDescription>
                                    <div className='grid grid-row'>
                                      <div className='mt-2 mb-4'>
                                        <Input className='w-full' onChange={(e)=>{setNewName(e.target.value)}}></Input>
                                      </div>
                                      <DialogClose asChild>
                                        <Button onClick={handleCollectionRename} variant={"secondary"}>Save</Button>
                                      </DialogClose>
                                    </div>
                                </DialogHeader>
                              </DialogContent>
                            </Dialog>
                            </div>
                            <div className='col-span-1'>
                            <Dialog>
                            <DialogTrigger className='w-full h-full bg-red-500 rounded-md items-center justify-center flex'><Trash size={"20px"} color='white'/></DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete Collection</DialogTitle>
                                  <DialogDescription className=''>
                                    Are you sure you want to delete this collection?
                                  </DialogDescription>
                                  <div className='h-[10px]'></div>
                                  <div className='grid grid-cols-2 gap-2'>
                                    <DialogClose asChild>
                                      <Button onClick={handleDeleteCollection} variant={"destructive"}>Delete</Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                      <Button variant={"outline"}>Cancel</Button>
                                    </DialogClose>
                                  </div>
                                </DialogHeader>
                              </DialogContent>
                            </Dialog>
                            </div>
                          </div>
                        <h3 className="text-lg font-semibold mb-4">Documents</h3>
                        <ScrollArea className='mb-4 h-[180px] outline outline-gray-200 outline-1 flex flex-col rounded-sm'>
                        {documentList.length > 0 ? (
                          documentList.map((document: any, index: number) => (
                            <Document
                              checkRoot={checkRoot}
                              key={document._id || index} // Using a unique identifier like _id
                              id={document._id}
                              name={`[${index}]: ${formatDocument(document)}`} // Format the document
                              setOpenDocument={setOpenDocument}
                              setActiveDocument={setActiveDocument}
                              selectDocument={selectDocument}
                              setSelectDocument={setSelectDocument}
                            />
                          ))
                        ) : (
                          <div className='text-gray-500 text-sm text-center'>No documents found</div>
                        )}
                        </ScrollArea>
                        <Dialog open={openDocument}>
                          <DialogContent className='[&>button]:hidden' onInteractOutside={()=>{setOpenDocument(false)}}>
                            <DialogHeader>
                              <DialogTitle>Edit document</DialogTitle>
                              <DialogDescription className='h-[25px]'>
                                _ID : {activeDocument}
                              </DialogDescription>
                              <div className="text-left">
                                <CodeMirror
                                  height="200px"
                                  className="mb-4 mt-4"
                                  extensions={[json()]}
                                  value={documentData}
                                  onChange={(value: string) => setDocumentData(value)}
                                  theme="dark"
                                />
                              </div>
                              <div className="flex gap-2 mt-4">
                                <div className='w-full grid grid-cols-2 gap-4'>
                                <DialogClose className='col-span-1' asChild>
                                      <Button onClick={handleDeleteDocument} variant="destructive">Delete</Button>
                                    </DialogClose>
                                  <DialogClose className='col-span-1' asChild>
                                    <Button onClick={handleUpdateDocument} variant="outline">Save</Button>
                                  </DialogClose>
                                </div>
                              </div>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                      </motion.div>
                      <div>
                        <Dialog>
                          <DialogTrigger disabled={selectDocument.length === 0} className={`h-[2.5em] w-full text-sm  ${selectDocument.length === 0 ? 'text-gray-400 bg-gray-50' : 'bg-red-500 text-white'} rounded-md items-center justify-center`}>Delete Documents</DialogTrigger>
                          <DialogContent className="[&>button]:hidden">
                            <DialogHeader>
                              <DialogTitle>Delete Document</DialogTitle>
                              <DialogDescription className=''>
                                {/* count the length of selectdocument */}

                                Are you sure you want to delete {selectDocument.length} documents?
                              </DialogDescription>
                              <div className='h-[10px]'></div>
                              <div className='grid grid-cols-2 gap-2'>
                                <DialogClose asChild>
                                  <Button onClick={handleDeleteDocument} variant={"destructive"}>Delete</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                  <Button onClick={()=>{
                                    setCheckRoot(true)
                                  }} variant={"outline"}>Cancel</Button>
                                </DialogClose>
                              </div>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TabsContent>
                  </AnimatePresence>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </motion.div>
    </motion.div>
  )
}