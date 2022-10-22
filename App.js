import { StyleSheet, Text, TextInput, TouchableOpacity, View, Button, Alert, ScrollView } from 'react-native';
import { theme } from './color'
import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function App() {

  const [sayThanks, setSayThanks] = useState(true);
  const [thanksList, setThanksList] = useState({});
  const [text, setText] = useState("");
  const [edittingText,setEdittingText] = useState("")
  const [countTodayWork, setCountTodayWork] = useState(0);
  const [listCounter , setListCounter] = useState([]);
  const [listInitialKey,setListInitialKey] = useState([]);
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const today = year + '년' + month + '월' + day + '일';

  const [isModify, setIsModify] = useState();


  const STORAGE_KEY = "@thanks";

  const isModifying = (key) => {
    if (isModify == key)
      setIsModify(false);
    else {
      setIsModify(key);
      let newThanks = {...thanksList};  
      setEdittingText(newThanks[key].text);
    }

  }

 

  const modifyStorage = async (key) => {

    if (edittingText === "")
    return;

    let newThanks = {...thanksList};  
    Object.assign(newThanks[key], { text: edittingText, sayThanks, date: newThanks[key].date });
    setThanksList(newThanks);
    await saveToStorage(newThanks);

    setEdittingText("");
    setIsModify(false);
  }

  const onChangeText = (payload) => {
    setText(payload);
  }
  const onChangeEdittingText = (payload)=>{
    setEdittingText(payload);
  }

  const sayWish = () => {
    setSayThanks(false);
  }
  const sayThankYou = () => {
    setSayThanks(true);
  }

 
  const addThanks = async () => {
    if (text === "")
      return;

    if (sayThanks == false)
      Alert.alert("전달하시겠습니까?", "신중하게 결정해주세요",
        [
          { text: "아니요. 좀 더 생각을.." },
          {
            text: "예",
            style: "destructive",
            onPress: () => {
              Alert.alert("소원이 우주로 신속하게 잘 전달이 되었습니다. 감사합니다.");
              setText("");
            }
          }
        ]
      )
    if (sayThanks == true) {
      const newThanks = Object.assign({}, thanksList, { [Date.now()]: { text, sayThanks, date: today } });
      setThanksList(newThanks);
      setText("");
      await saveToStorage(newThanks);
    }

  }


  const saveToStorage = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {

    }
  }

  const loadStorage = async () => {
    const t = await AsyncStorage.getItem(STORAGE_KEY);
    if (t != null)
      setThanksList(JSON.parse(t));
  }

  useEffect(() => {
    loadStorage();
  }, [])


  const deleteStorage = async (key) => {
    const newThanks = { ...thanksList };
    delete newThanks[key];
    setThanksList(newThanks);
    await saveToStorage(newThanks);
  }

  const removeValue = async () => {
    try {

      Alert.alert("감사의 기운을 보내시겠습니까?", "기운이 널리 퍼져 더 강해집니다.",
        [
          { text: "아니요. 좀 더 생각을.." },
          {
            text: "예",
            onPress: async () => {
              await AsyncStorage.removeItem(STORAGE_KEY)
              const newThanks = {};
              setThanksList(newThanks);
              Alert.alert("당신이 보낸 감사가 우주의 기운을 타고 널리 퍼집니다.");
            }
          }
        ]

      )
    } catch (e) {
      // remove error
    }

  }

  const countTodayThanks = useMemo(
    () => {
      let i = 0;
      Object.keys(thanksList).map((key) => {
        if (thanksList[key].date == today) {
          i++;
        }
        setCountTodayWork(i);
      })
    }
    , [thanksList])

  const countListDate = useMemo(
()=>{
  let listKeyArr = [];
  let i=0;
  Object.keys(thanksList).map((key)=>{
  if(thanksList[Object.keys(thanksList)[Object.keys(thanksList).indexOf(key)+1]]!=undefined){
    if(thanksList[key].date !=
      thanksList[Object.keys(thanksList)[Object.keys(thanksList).indexOf(key)+1]].date)
      {
        listKeyArr[i]= key
        i++;
      }
    } 
  if(thanksList[Object.keys(thanksList)[Object.keys(thanksList).indexOf(key)+1]]==undefined){
    listKeyArr[i]= key
    i++;
  }
  })
  let listCountArr =[];
  for(let j = 0; j<listKeyArr.length;j++){
    Object.keys(thanksList).map((key)=>{
      if(thanksList[key].date == thanksList[listKeyArr[j]].date){
        if(listCountArr[j]==null){
        listCountArr[j] = 1;
        }else{
          listCountArr[j]++;
        }

      }
    })
  }
  

      setListInitialKey(listKeyArr)
      setListCounter(listCountArr);

    },[thanksList])

  return (
    <View style={{ ...styles.container, backgroundColor: sayThanks ? "#F8F8FA" : "black" }}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={sayThankYou}>
          <Text style={{ ...styles.btnText, color: sayThanks ? "black" : "white" }}>감사일기 쓰기</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={sayWish}>
          <Text style={{ ...styles.btnText, color: sayThanks ? "black" : "white" }}>소원보내기</Text>
        </TouchableOpacity>
      </View>

      {/* 작성폼 */}
      <View>
        <TextInput
          onChangeText={onChangeText}
          multiline
          value={text}
          style={styles.input}
        ></TextInput>
        <Button
          onPress={addThanks}
          title={sayThanks?"작성하기":"전달하기"}></Button>
      </View>

      {/* 감사리스트 */}
      <ScrollView>
        {
          Object.keys(thanksList).reverse().map((key) =>
            thanksList[key].sayThanks == sayThanks ? (
              <View key={key}>
                <View style ={styles.showDate}>
                {Object.keys(thanksList)[Object.keys(thanksList).indexOf(key)+1]==undefined?
                <Text>{thanksList[key].date}</Text>:
                thanksList[Object.keys(thanksList)[Object.keys(thanksList).indexOf(key)+1]].date
                ===thanksList[key].date?null:<Text>{thanksList[key].date}</Text>}
                {listInitialKey.indexOf(key)!=-1?
                <Text>{listCounter[listInitialKey.indexOf(key)]}개</Text>:null}
                </View>
                <View style={styles.toDo}>
                  <Text>{Object.keys(thanksList).indexOf(key) + 1}번</Text>
                  <Text style={styles.toDoText}>{thanksList[key].text}</Text>
                  <TouchableOpacity>
                    <MaterialCommunityIcons name="pencil" size={24} color="black"
                      onPress={() => { isModifying(key) }} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { deleteStorage(key) }} style={styles.deleteButton}>
                    <Feather name="delete" size={24} color="red" />
                  </TouchableOpacity>
                </View>
                {isModify == key ? <View>
                  <TextInput 
                  style={styles.modify}
                  onChangeText={onChangeEdittingText}
                  value={edittingText}

                  ></TextInput>
                  <Button title="수정하기"
                    onPress={()=>{modifyStorage(key)}}
                  ></Button>
                </View> : null}
              </View>
            ) : null)}

      </ScrollView>
{sayThanks?<View style={styles.footer}>
        <View style={styles.footerText}>
          <Text>총{Object.keys(thanksList).length}개의 감사</Text>
          <Text>오늘의 감사: {countTodayWork}개</Text>       
          </View> 
          <Button
          onPress={removeValue}
          style={styles.sendingButton}
          title="우주로 감사 전송하기"></Button>
      </View>:null}      
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.main,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 100,
    paddingBottom: 10,
  },
  input: {
    borderWidth: 2,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    marginVertical: 10
  },
  btnText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 3
  },
  toDo: {
    borderBottomColor: "gray",
    borderBottomWidth: 2,
    marginBottom: 10,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%"
  },
  toDoText: {
    fontSize: 16,
    paddingLeft: 20,
    width: "70%"
  },
  footer: {
    padding: 10
  },
  deleteButton: {

  },
  footerText: {
    justifyContent: "space-between",
    flexDirection: "row",

  },
  modify: {
    borderWidth: 2,
    backgroundColor: "white",
    padding: 30,
    borderRadius: 10,
    marginVertical: 10
  },
  showDate:{
    flexDirection:"row",
    justifyContent:"space-between",
    fontSize:30,
    paddingTop:10
  },
  sendingButton:{
  }

});
