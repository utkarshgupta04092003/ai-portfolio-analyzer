import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

def test_openai_key():
    # Load variables from .env
    load_dotenv()
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ OPENAI_API_KEY is missing from your .env file.")
        return
        
    if "***************" in api_key or api_key == "sk-your-openai-api-key-here":
        print("❌ OPENAI_API_KEY is still set to the default placeholder in .env.")
        return
        
    print(f"Attempting to connect to OpenAI using key starting with: {api_key[:12]}...")
    
    try:
        # Initialize a basic LangChain chat model
        llm = ChatOpenAI(model="gpt-5.2", temperature=0)
        
        # Send a tiny prompt to verify authentication
        print("Sending ping to OpenAI API...")
        response = llm.invoke([HumanMessage(content="Hello! How are you doing.")])
        
        print("\n✅ OpenAI API Key is working successfully!")
        print(f"OpenAI Response: {response.content}")
        
    except Exception as e:
        print("\n❌ OpenAI API Key failed validation.")
        print(f"Error details: {e}")

if __name__ == "__main__":
    test_openai_key()
