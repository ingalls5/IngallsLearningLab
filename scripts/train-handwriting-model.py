import numpy as np,json,time,sys
from PIL import Image
from scipy.ndimage import minimum_filter,maximum_filter
from sklearn.neural_network import MLPClassifier
z=np.load(sys.argv[1]);rng=np.random.default_rng(42); train_images=z['x_train']; train_labels=z['y_train']; test_images=z['x_test']; test_labels=z['y_test']
def prep(im):
 yy,xx=np.where(im>30)
 if len(xx)==0:return np.zeros(400)
 box=im[yy.min():yy.max()+1,xx.min():xx.max()+1];h,w=box.shape;scale=16/max(h,w)
 a=np.array(Image.fromarray(box).resize((max(1,round(w*scale)),max(1,round(h*scale))),Image.Resampling.BILINEAR),dtype=np.float32)/255
 out=np.zeros((20,20),dtype=np.float32);h,w=a.shape;out[(20-h)//2:(20-h)//2+h,(20-w)//2:(20-w)//2+w]=a
 return out.ravel()
idx=rng.choice(len(z['x_train']),40000,replace=False);x=[];y=[]
for i in idx:
 im=train_images[i]; x.append(prep(im));y.append(train_labels[i])
 if i%2==0:
  thin=minimum_filter(im,size=2);x.append(prep(thin));y.append(train_labels[i])
x=np.array(x);y=np.array(y)
m=MLPClassifier(hidden_layer_sizes=(128,64),max_iter=30,batch_size=256,learning_rate_init=.001,random_state=42,early_stopping=True,n_iter_no_change=4).fit(x,y)
test=np.array([prep(im) for im in test_images]); print('Held-out MNIST accuracy',m.score(test,test_labels),flush=True)
obj={'size':20,'weights':[np.round(v,5).tolist() for v in m.coefs_],'biases':[np.round(v,5).tolist() for v in m.intercepts_]}
open(sys.argv[2],'w').write(json.dumps(obj,separators=(',',':')))
